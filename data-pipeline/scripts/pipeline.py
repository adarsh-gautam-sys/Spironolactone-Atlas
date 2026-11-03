"""Resumable source extraction and aggregate exports. Run from any directory."""
import argparse
import csv
import gzip
import hashlib
import json
import os
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import requests
from dotenv import load_dotenv
from schemas import validate_rows

ROOT = Path(__file__).resolve().parents[2]
PIPE = ROOT / 'data-pipeline'
FDA = 'https://api.fda.gov/drug/event.json'
NAME_QUERY = '(patient.drug.openfda.generic_name:spironolactone OR patient.drug.medicinalproduct:spironolactone OR patient.drug.openfda.brand_name:aldactone OR patient.drug.medicinalproduct:aldactone OR patient.drug.openfda.brand_name:carospir OR patient.drug.medicinalproduct:carospir)'
TOPICS = {
    'acne': ['acne'], 'hirsutism-pcos': ['hirsutism', 'polycystic ovary syndrome', 'pcos'],
    'hair-loss': ['female pattern hair loss', 'androgenetic alopecia'],
    'hfpef': ['preserved ejection fraction', 'hfpef'],
    'resistant-hypertension': ['resistant hypertension'],
    'gender-affirming': ['transgender', 'gender affirming', 'feminizing', 'feminising'],
    'central-serous': ['central serous chorioretinopathy'],
    'hidradenitis': ['hidradenitis suppurativa'],
    'pms-pmdd': ['premenstrual syndrome', 'premenstrual dysphoric disorder'],
    'proteinuria-ckd': ['proteinuria', 'chronic kidney disease'],
}
FLAGS = ['seriousnessdeath', 'seriousnesslifethreatening', 'seriousnesshospitalization',
         'seriousnessdisabling', 'seriousnesscongenitalanomali', 'seriousnessother']


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    temp.replace(path)


def normalize(value):
    if value is None:
        return ''
    return re.sub(r'[^a-z0-9]+', ' ', str(value).casefold()).strip()


def reaction_term(value):
    """Normalize spelling case/whitespace only; do not infer MedDRA synonyms."""
    return re.sub(r'\s+', ' ', str(value).strip().casefold()) if value else ''


def matching(drug):
    names = [drug.get('medicinalproduct', '')]
    for key in ('generic_name', 'brand_name', 'substance_name'):
        names.extend((drug.get('openfda') or {}).get(key, []))
    return any(re.search(r'\b(spironolactone|aldactone|carospir)\b', normalize(n)) for n in names)


def product_kind(drug):
    ingredients = (drug.get('openfda') or {}).get('substance_name', [])
    generics = (drug.get('openfda') or {}).get('generic_name', [])
    text = ' '.join([drug.get('medicinalproduct') or '', *ingredients, *generics])
    if re.search(r'hydrochlorothiazide|furosemide|frusemide|aldactazide|lasilactone', text, re.I):
        return 'combination'
    normalized = [normalize(v) for v in ingredients]
    if normalized:
        return 'single' if set(normalized) == {'spironolactone'} else 'unresolved'
    if generics:
        return 'single' if {normalize(v) for v in generics} == {'spironolactone'} else 'unresolved'
    if normalize(drug.get('medicinalproduct', '')) in ('spironolactone', 'aldactone', 'carospir'):
        return 'single'
    return 'unresolved'


def age_band(patient):
    factors = {'800': 10, '801': 1, '802': 1/12, '803': 7/365.25, '804': 1/365.25, '805': 1/8766}
    try:
        age = float(patient['patientonsetage']) * factors[patient['patientonsetageunit']]
        if not 0 <= age <= 120:
            return None
        return '<18' if age < 18 else '18–44' if age < 45 else '45–64' if age < 65 else '65–74' if age < 75 else '75+'
    except (KeyError, ValueError, TypeError):
        return None


class Client:
    def __init__(self, run, offline=False):
        self.run = run
        self.offline = offline
        self.session = requests.Session()
        self.session.headers['User-Agent'] = 'SpironolactoneAtlas/0.2 (public research)'
        self.lock = threading.RLock()
        self.rate_lock = threading.Lock()
        self.last_request = 0.0
        self.manifest_path = run / 'manifest.json'
        self.manifest = json.loads(self.manifest_path.read_text()) if self.manifest_path.exists() else {'startedAt': datetime.now(timezone.utc).isoformat(), 'requests': []}

    def get(self, endpoint, params):
        key = hashlib.sha256(json.dumps([endpoint, params], sort_keys=True).encode()).hexdigest()
        cache = self.run / (key + '.json.gz')
        existing = next((r for r in self.manifest['requests'] if r['cache'] == cache.name), None)
        if existing and cache.exists():
            if hashlib.sha256(cache.read_bytes()).hexdigest() != existing['sha256']:
                raise ValueError('Cached response hash mismatch')
            with gzip.open(cache, 'rt', encoding='utf-8') as f:
                return json.load(f), existing.get('next')
        authenticated = dict(params)
        if self.offline:
            raise RuntimeError('Offline replay requires a cached response for every request')
        if endpoint.startswith('https://api.fda.gov/') and os.getenv('OPENFDA_API_KEY'):
            authenticated['api_key'] = os.environ['OPENFDA_API_KEY']
        for attempt in range(4):
            try:
                with self.rate_lock:
                    time.sleep(max(0, .26 - (time.monotonic() - self.last_request)))
                    self.last_request = time.monotonic()
                response = self.session.get(endpoint, params=authenticated, timeout=(15, 120))
            except requests.RequestException:
                if attempt == 3:
                    raise RuntimeError('Network request failed; resume the same run') from None
                time.sleep(2 ** attempt)
                continue
            if response.status_code == 429 or response.status_code >= 500:
                if attempt == 3:
                    raise RuntimeError(f'HTTP {response.status_code}; resume the same run')
                time.sleep(min(60, max(2 ** attempt, int(response.headers.get('Retry-After', '0')))))
                continue
            break
        if response.status_code == 404 and endpoint == FDA and response.json().get('error', {}).get('code') == 'NOT_FOUND':
            payload = {'meta': {'results': {'total': 0}}, 'results': []}
        elif response.status_code == 200:
            payload = response.json()
        else:
            raise RuntimeError(f'HTTP {response.status_code} for {endpoint}; no zero count inferred')
        next_params = None
        if 'next' in response.links:
            link = urlparse(response.links['next']['url'])
            if link.scheme != 'https' or link.netloc != 'api.fda.gov' or link.path != '/drug/event.json':
                raise ValueError('Unexpected pagination destination')
            next_params = {k: v[0] for k, v in parse_qs(link.query).items() if k != 'api_key'}
        self.run.mkdir(parents=True, exist_ok=True)
        with gzip.open(cache, 'wt', encoding='utf-8', compresslevel=1) as f:
            json.dump(payload, f, separators=(',', ':'))
        with self.lock:
            self.manifest['requests'].append({'endpoint': endpoint, 'params': params,
                'retrievedAt': datetime.now(timezone.utc).isoformat(), 'httpStatus': response.status_code,
                'cache': cache.name, 'sha256': hashlib.sha256(cache.read_bytes()).hexdigest(),
                'next': next_params, 'apiLastUpdated': payload.get('meta', {}).get('last_updated'),
                'recordCount': len(payload.get('results', payload.get('studies', payload.get('esearchresult', {}).get('idlist', []))))})
            write_json(self.manifest_path, self.manifest)
        time.sleep(.4)
        return payload, next_params


def project_report(raw):
    patient = raw.get('patient', {})
    row = {k: raw.get(k) for k in ['safetyreportid', 'safetyreportversion', 'receivedate', 'receiptdate', 'occurcountry', 'serious', *FLAGS]}
    row['patient'] = {k: patient.get(k) for k in ['patientsex', 'patientonsetage', 'patientonsetageunit']}
    row['patient']['drug'] = [{k: d.get(k) for k in ['medicinalproduct', 'drugcharacterization', 'drugindication', 'openfda']} for d in patient.get('drug', [])]
    row['patient']['reaction'] = patient.get('reaction', [])
    return row


def extract_year(client, year):
    for year in [year]:
        params = {'search': f'{NAME_QUERY} AND receivedate:[{year}0101 TO {year}1231]', 'limit': 500, 'sort': 'receivedate:asc'}
        selected, conflicts = {}, set()
        buckets, _ = client.get(FDA, {'search': params['search'], 'count': 'receivedate', 'limit': 1000})
        expected = sum(row['count'] for row in buckets['results'])
        expected_dates = Counter({str(row.get('time', row.get('term'))): row['count'] for row in buckets['results']})
        downloaded_dates = Counter()
        if len(buckets['results']) > 366:
            raise ValueError('Unexpected date bucket coverage')
        downloaded, updates = 0, set()
        while params:
            payload, following = client.get(FDA, params)
            total = payload['meta']['results']['total']
            # search_after pages can report changing/remaining hit totals.
            # Reconcile against independent complete date buckets instead.
            if payload['meta'].get('last_updated'):
                updates.add(payload['meta']['last_updated'])
            for raw in payload['results']:
                downloaded += 1
                downloaded_dates[str(raw.get('receivedate'))] += 1
                rid = raw['safetyreportid']
                row = project_report(raw)
                rank = (int(raw.get('safetyreportversion') or 0), raw.get('receiptdate') or '')
                previous = selected.get(rid)
                if previous is None or rank > previous[0]:
                    selected[rid] = (rank, row)
                    conflicts.discard(rid)
                elif rank == previous[0] and row != previous[1]:
                    conflicts.add(rid)
            if not following and downloaded < expected:
                if downloaded > 25000:
                    raise ValueError('Partition requires smaller date windows')
                following = {'search': params['search'], 'limit': 500, 'sort': 'receivedate:asc', 'skip': downloaded}
            if following == params:
                raise ValueError('Pagination did not advance')
            params = following
        if downloaded != expected:
            raise ValueError(f'{year}: downloaded record count does not match API total')
        repairs = []
        disputed = {day for day in set(downloaded_dates) | set(expected_dates) if downloaded_dates[day] != expected_dates[day]}
        selected = {rid: item for rid, item in selected.items() if str(item[1]['receivedate']) not in disputed}
        conflicts.intersection_update(selected)
        for day in sorted(set(downloaded_dates) | set(expected_dates)):
            if downloaded_dates[day] == expected_dates[day]:
                continue
            # Replace a disputed date with a fresh, narrow query; retain old cache as audit evidence.
            selected = {rid: item for rid, item in selected.items() if str(item[1]['receivedate']) != day}
            conflicts.intersection_update(selected)
            recovered = []
            while len(recovered) < expected_dates[day]:
                payload, _ = client.get(FDA, {'search': f'{NAME_QUERY} AND receivedate:[{day} TO {day}]',
                    'limit': 500, 'skip': len(recovered), 'sort': 'receivedate:asc'})
                records = payload['results']
                if not records or any(str(r.get('receivedate')) != day for r in records):
                    raise ValueError('Narrow-date repair returned invalid records')
                recovered.extend(records)
            if len(recovered) != expected_dates[day]:
                raise ValueError('Narrow-date repair does not match date count')
            for raw in recovered:
                rid = raw['safetyreportid']
                row = project_report(raw)
                rank = (int(raw.get('safetyreportversion') or 0), raw.get('receiptdate') or '')
                previous = selected.get(rid)
                if previous is None or rank > previous[0]:
                    selected[rid] = (rank, row)
                    conflicts.discard(rid)
                elif rank == previous[0] and row != previous[1]:
                    conflicts.add(rid)
            repairs.append({'date': day, 'discardedRecords': downloaded_dates[day], 'replacementRecords': len(recovered)})
            downloaded_dates[day] = len(recovered)
        if downloaded_dates != expected_dates:
            raise ValueError(f'{year}: date reconciliation failed')
        client.manifest.setdefault('faersPartitions', {})[str(year)] = {
            'expectedRecords': expected, 'downloadedRecords': downloaded, 'uniqueIds': len(selected),
            'duplicateRecords': downloaded-len(selected), 'excludedConflictingIds': len(conflicts), 'updates': sorted(updates), 'dateRepairs': repairs}
        with client.lock:
            write_json(client.manifest_path, client.manifest)
        print(f'FAERS {year}: {downloaded} records reconciled; {len(conflicts)} conflicting IDs excluded', flush=True)
        for rid, (_, row) in selected.items():
            if rid not in conflicts:
                yield row


def fetch_year(client, year):
    try:
        return list(extract_year(client, year))
    except Exception as error:
        print(f'FAERS {year} failed: {type(error).__name__}: {error}', flush=True)
        raise


def extract_faers(client):
    # Four independent date partitions; page cursors remain sequential per year.
    with ThreadPoolExecutor(max_workers=4) as pool:
        pending = [pool.submit(fetch_year, client, y) for y in range(2004, 2026)]
        for future in as_completed(pending):
            pending.remove(future)
            yield from future.result()


def clean_faers(rows):
    audit = Counter()
    reactions, stratified, summaries, indications, criteria, outcomes, interactions = [Counter() for _ in range(7)]
    seen = set()
    for report in rows:
        rid = report['safetyreportid']
        if rid in seen:
            raise ValueError('Overlapping FAERS partitions')
        seen.add(rid)
        audit['candidates'] += 1
        drugs = report.get('patient', {}).get('drug', [])
        suspects = [d for d in drugs if matching(d) and str(d.get('drugcharacterization')) == '1']
        if not suspects:
            audit['excluded-no-matching-suspect'] += 1
            continue
        kinds = {product_kind(d) for d in suspects}
        # Ambiguous mixtures are excluded conservatively, rather than guessed single-ingredient.
        if kinds != {'single'}:
            audit['excluded-combination' if 'combination' in kinds else 'excluded-unresolved-product'] += 1
            continue
        audit['retained'] += 1
        patient = report.get('patient', {})
        sex = {'1': 'male', '2': 'female'}.get(str(patient.get('patientsex')), 'unknown')
        age = age_band(patient)
        seriousness = {'1': 'serious', '2': 'non-serious'}.get(str(report.get('serious')), 'unknown')
        date = report.get('receivedate', '')
        year = int(date[:4]) if re.fullmatch(r'\d{8}', date) else None
        country = report.get('occurcountry') or None
        summaries[(year, seriousness, sex, age, country)] += 1
        for field in FLAGS:
            if str(report.get(field)) == '1':
                criteria[field] += 1
        pairs = {(normalize(d.get('drugindication', '')) or None) for d in suspects}
        for indication in pairs:
            indications[indication] += 1
        terms = {reaction_term(r.get('reactionmeddrapt')) for r in patient.get('reaction', []) if reaction_term(r.get('reactionmeddrapt'))}
        for term in terms:
            reactions[term] += 1
            stratified[(term, seriousness, sex, age)] += 1
        for outcome in {r.get('reactionoutcome') for r in patient.get('reaction', [])}:
            outcomes[outcome] += 1
        # Counts co-reported names, without asserting an interaction or ingredient equivalence.
        if any(normalize(t) in ('hyperkalaemia', 'hyperkalemia') for t in terms):
            for name in {normalize(d.get('medicinalproduct', '')) for d in drugs if not matching(d)} - {''}:
                interactions[name] += 1
    if sum(summaries.values()) != audit['retained']:
        raise ValueError('Cohort reconciliation failed')
    return audit, reactions, stratified, summaries, indications, criteria, outcomes, interactions


def envelope(client, source_id, name, url, unit, dimensions, overlap, data, complete=True, denominator=None, limitations=None):
    requests_for_source = [r for r in client.manifest['requests'] if r['endpoint'] == url]
    return {'schemaVersion': '1.0', 'generatedAt': datetime.now(timezone.utc).isoformat(),
        'sources': [{'id': source_id, 'name': name, 'url': url, 'retrievedAt': requests_for_source[-1]['retrievedAt']}],
        'queries': [{'sourceId': source_id, 'query': json.dumps(r['params'], sort_keys=True),
            'retrievedAt': r['retrievedAt'], 'filters': {}, 'recordCount': cached_count(client, r)} for r in requests_for_source],
        'limitations': limitations or [], 'recordUnit': unit, 'cohortDefinition': 'See data-pipeline/PIPELINE.md and snapshot manifest',
        'coverage': {'start': '2004-01-01', 'end': '2025-12-31', 'dateBasis': 'receivedate', 'extractionComplete': complete},
        'dimensions': dimensions, 'categoriesOverlap': overlap,
        **({'denominator': {'count': denominator, 'definition': 'Retained same-entry suspect single-ingredient reports'}} if denominator is not None else {}), 'data': data}


def cached_count(client, request):
    if 'recordCount' in request:
        return request['recordCount']
    with gzip.open(client.run / request['cache'], 'rt', encoding='utf-8') as f:
        payload = json.load(f)
    return len(payload.get('results', payload.get('studies', payload.get('esearchresult', {}).get('idlist', []))))


def validate(dataset):
    if dataset['schemaVersion'] != '1.0' or not dataset['coverage']['extractionComplete']:
        raise ValueError('Incomplete dataset cannot be published')
    for key in ('generatedAt',):
        datetime.fromisoformat(dataset[key])
    ids = {s['id'] for s in dataset['sources']}
    if not ids or len(ids) != len(dataset['sources']):
        raise ValueError('Invalid source IDs')
    for source in dataset['sources']:
        datetime.fromisoformat(source['retrievedAt'])
        if not source['url'].startswith('https://'):
            raise ValueError('Source URL missing')
    for query in dataset['queries']:
        if query['sourceId'] not in ids or type(query['recordCount']) is not int or query['recordCount'] < 0:
            raise ValueError('Invalid query provenance')
        datetime.fromisoformat(query['retrievedAt'])
    for row in dataset['data']:
        if not set(row['sourceIds']) <= ids or not row['sourceIds']:
            raise ValueError('Unresolved source reference')
        if row.get('labelSourceId') is not None and row['labelSourceId'] not in ids:
            raise ValueError('Unresolved label source reference')
        for key, value in row.items():
            if key.endswith('Count') and value is not None and (type(value) is not int or value < 0):
                raise ValueError('Invalid count')
        if 'reportCount' in row and 'denominator' in dataset and row['reportCount'] > dataset['denominator']['count']:
            raise ValueError('Row count exceeds report denominator')


def extract_labels(client, output):
    url = 'https://api.fda.gov/drug/label.json'
    rows = []
    for brand in ('aldactone', 'carospir'):
        payload, _ = client.get(url, {'search': f'openfda.brand_name:{brand}', 'limit': 100})
        for label in payload['results']:
            if brand not in [normalize(v) for v in label.get('openfda', {}).get('brand_name', [])]:
                raise ValueError('Unexpected label brand match')
            for field in ('indications_and_usage', 'contraindications', 'warnings_and_cautions', 'adverse_reactions', 'drug_interactions'):
                for index, text in enumerate(label.get(field, [])):
                    rows.append(dict(id=f"{label['set_id']}:{field}:{index}", product=brand,
                        jurisdiction='US', setId=label['set_id'], effectiveDate=label.get('effective_time'),
                        section=field, text=text, sourceIds=['FDA-LABEL']))
    if not rows:
        raise ValueError('No label sections')
    ds = envelope(client, 'FDA-LABEL', 'openFDA product label sections', url, 'label-entry', ['product', 'section'], False, rows,
        limitations=['Label sections retain source text, not independent medical interpretation.',
            'Current US product documents; no India comparison or MedDRA mapping.', 'Structured indication and interaction appraisal remains pending.'])
    ds['coverage'] = dict(start=None, end=None, dateBasis='product document effective date; retrieved snapshot', extractionComplete=True)
    export(output, 'label-sections', ds)


def export(output, name, dataset):
    validate(dataset)
    validate_rows(name, dataset)
    write_json(output / f'{name}.json', dataset)
    rows = dataset['data']
    with (output / f'{name}.csv').open('w', newline='', encoding='utf-8') as f:
        if rows:
            writer = csv.DictWriter(f, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v for k, v in row.items()} for row in rows)


def export_faers(client, output):
    audit, reactions, stratified, summaries, indications, criteria, outcomes, interactions = clean_faers(extract_faers(client))
    n = audit['retained']
    if not n:
        raise ValueError('No retained reports; inspect cohort')
    client.manifest['cohortAudit'] = dict(audit)
    limitations = ['Spontaneous reports cannot establish incidence or causality.',
        'Reactions belong to reports, not individual drugs. Different report IDs can describe duplicate cases.',
        'Only conservative single-ingredient same-entry role-1 matches retained. Unknown product names excluded.',
        'No MedDRA SOC mapping acquired. Sex and age are as reported; missing values remain unknown.']
    def emit(name, rows, dims, overlap=True, unit='report'):
        ds = envelope(client, 'FDA-EVENT', 'openFDA drug adverse events', FDA, unit, dims, overlap, rows, denominator=n, limitations=limitations)
        export(output, name, ds)
    def adr(term, count, seriousness='unknown', sex='unknown', age=None):
        return dict(preferredTerm=term, systemOrganClass=None, reportCount=count, seriousness=seriousness,
            reactionOutcome=None, sex=sex, ageBand=age, reportYear=None, country=None, coSuspectDrugs=[], sourceIds=['FDA-EVENT'])
    emit('adverse-reactions', [adr(t, c) for t, c in reactions.most_common()], ['preferredTerm'])
    top = {t for t, _ in reactions.most_common(50)}
    emit('adverse-reactions-filtered', [adr(t, c, s, x, a) for (t, s, x, a), c in stratified.items() if t in top], ['preferredTerm', 'seriousness', 'sex', 'ageBand'])
    emit('report-summary', [dict(reportYear=y, seriousness=s, sex=x, ageBand=a, country=c, reportCount=n, sourceIds=['FDA-EVENT']) for (y, s, x, a, c), n in summaries.items()], ['reportYear', 'seriousness', 'sex', 'ageBand', 'country'], False)
    emit('usage', [dict(reportedIndication=t or '', condition=None, labelStatus='undetermined' if t else 'unspecified', jurisdiction='US', referenceProduct='Aldactone tablets', labelSourceId=None, reportCount=c, sourceIds=['FDA-EVENT']) for t, c in indications.most_common()], ['reportedIndication'], True, 'report-indication')
    emit('seriousness-criteria', [dict(criterion=t, reportCount=c, sourceIds=['FDA-EVENT']) for t, c in criteria.items()], ['criterion'])
    emit('reaction-outcomes', [dict(outcome=t, reportCount=c, sourceIds=['FDA-EVENT']) for t, c in outcomes.items()], ['outcome'])
    emit('hyperkalaemia-coreported', [dict(reportedDrug=t, reportCount=c, sourceIds=['FDA-EVENT']) for t, c in interactions.most_common()], ['reportedDrug'])
    print(f'FAERS cohort: {dict(audit)}', flush=True)


def extract_trials(client, output):
    url = 'https://clinicaltrials.gov/api/v2/studies'
    params = {'query.intr': 'spironolactone', 'pageSize': 100, 'countTotal': 'true', 'format': 'json'}
    studies = {}
    expected = None
    while True:
        payload, _ = client.get(url, params)
        expected = payload['totalCount'] if expected is None else expected
        for row in payload['studies']:
            nct = row['protocolSection']['identificationModule']['nctId']
            if nct in studies:
                raise ValueError('Duplicate NCT ID')
            studies[nct] = row
        token = payload.get('nextPageToken')
        if not token:
            break
        if params.get('pageToken') == token:
            raise ValueError('Trial pagination did not advance')
        params = {**params, 'pageToken': token}
    if len(studies) != expected:
        raise ValueError('Trial total does not reconcile')
    rows = []
    excluded = Counter()
    for nct, record in studies.items():
        p = record['protocolSection']
        interventions = p.get('armsInterventionsModule', {}).get('interventions', [])
        if not any('spironolactone' in normalize(v) for d in interventions for v in [d.get('name', ''), *d.get('otherNames', [])]):
            excluded['no-verified-intervention'] += 1
            continue
        status = p['statusModule']
        date = status.get('startDateStruct', {}).get('date')
        year = int(date[:4]) if date else None
        if year and not 2004 <= year <= 2025:
            excluded['outside-window'] += 1
            continue
        rows.append({'nctId': nct, 'startYear': year, 'status': status.get('overallStatus'),
            'phases': p.get('designModule', {}).get('phases', []),
            'conditions': p.get('conditionsModule', {}).get('conditions', []),
            'countries': sorted({loc['country'] for loc in p.get('contactsLocationsModule', {}).get('locations', []) if loc.get('country')}),
            'sourceIds': ['CTG']})
    ds = envelope(client, 'CTG', 'ClinicalTrials.gov registered studies', url, 'study', ['nctId'], False, rows,
        limitations=['Registry records are not efficacy evidence. Missing start dates retained as unknown.', 'Conditions remain source text pending reviewed topic mapping.'])
    ds['coverage']['dateBasis'] = 'study start date; status at retrieval'
    export(output, 'trials', ds)
    client.manifest['trialsAudit'] = {'candidates': expected, 'retained': len(rows), 'exclusions': dict(excluded)}


def extract_pubmed(client, output):
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    rows = []
    for topic, words in TOPICS.items():
        expression = ' OR '.join(f'"{w}"[Title/Abstract]' for w in words)
        for year in range(2004, 2026):
            term = f'(spironolactone[MeSH Terms] OR spironolactone[Title/Abstract]) AND ({expression}) AND ("{year}/01/01"[Date - Publication] : "{year}/12/31"[Date - Publication])'
            payload, _ = client.get(url, {'db': 'pubmed', 'term': term, 'retmode': 'json', 'retmax': 9999, 'tool': 'spironolactone-atlas'})
            result = payload['esearchresult']
            if result.get('errorlist'):
                raise ValueError('PubMed rejected query')
            ids = result['idlist']
            count = int(result['count'])
            if len(set(ids)) != count:
                raise ValueError('PubMed IDs truncated or duplicated')
            rows.append(dict(condition=topic, year=year, publicationCount=count, trialCount=None, phase=None, status=None, country=None, sourceIds=['PUBMED']))
        print(f'PubMed {topic}: complete', flush=True)
    ds = envelope(client, 'PUBMED', 'PubMed topic searches', url, 'publication', ['condition', 'year'], True, rows,
        limitations=['Draft topic strings measure discoverability, not study quality or prescribing.', 'Topics and publication-date year searches may overlap. PMIDs cached for review; no efficacy inference.'])
    ds['coverage']['dateBasis'] = 'PubMed Date - Publication'
    export(output, 'research-publications', ds)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', required=True, help='New or existing snapshot name, letters/numbers/hyphens only')
    parser.add_argument('--source', choices=['faers', 'trials', 'pubmed', 'labels', 'all'], default='all')
    parser.add_argument('--offline', action='store_true', help='Require cached responses; never make network requests')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-zA-Z0-9-]+', args.run):
        parser.error('Invalid run name')
    load_dotenv(PIPE / '.env')
    client = Client(PIPE / 'raw' / 'phase-2' / args.run, offline=args.offline)
    output = PIPE / 'clean' / 'exports' / args.run
    for name, task in [('faers', export_faers), ('trials', extract_trials), ('pubmed', extract_pubmed), ('labels', extract_labels)]:
        if args.source in (name, 'all'):
            task(client, output)
            client.manifest.setdefault('completedSources', [])
            if name not in client.manifest['completedSources']:
                client.manifest['completedSources'].append(name)
            write_json(client.manifest_path, client.manifest)
    print(f'Validated staging exports: {output}', flush=True)


if __name__ == '__main__':
    main()
