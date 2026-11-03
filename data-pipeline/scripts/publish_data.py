"""Validate staged snapshots and publish aggregate/reference JSON and CSV files."""
import argparse
import hashlib
import json
import os
from pathlib import Path

from pipeline import PIPE, ROOT, Client, cached_count, export, validate, write_json
from schemas import SCHEMAS, validate_rows
from dotenv import load_dotenv


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--runs', nargs='+', required=True)
    args = parser.parse_args()
    load_dotenv(PIPE / '.env')
    mapping = json.loads((PIPE / 'indication-map.json').read_text())
    datasets, manifests = {}, []
    completed = set()
    for run in [*args.runs, '2026-11-03-reference']:
        if not run or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-' for c in run):
            parser.error('Invalid snapshot name')
        client = Client(PIPE / 'raw' / 'phase-2' / run)
        completed.update(client.manifest.get('completedSources', []))
        audit = json.loads(json.dumps(client.manifest))
        for request in audit['requests']:
            request['recordCount'] = cached_count(client, request)
        manifests.append({'run': run, **audit})
        for path in (PIPE / 'clean' / 'exports' / run).glob('*.json'):
            if path.stem not in SCHEMAS:
                continue
            if path.stem in datasets:
                raise ValueError('Duplicate staged dataset')
            dataset = json.loads(path.read_text(encoding='utf-8'))
            for query in dataset['queries']:
                request = next(r for r in audit['requests'] if json.dumps(r['params'], sort_keys=True) == query['query'])
                query['recordCount'] = request['recordCount']
            if path.stem == 'usage':
                for row in dataset['data']:
                    row['condition'] = mapping['exact'].get(row['reportedIndication'])
                dataset['limitations'].append('Only explicit exact-term mappings applied; all label classifications remain unresolved until product/population context is appraised.')
                dataset['limitations'].append('Rows count report–normalized source-term pairs. Synonyms can co-occur within one report; do not sum mapped-condition rows to infer distinct report–condition counts.')
            if path.stem == 'adverse-reactions-filtered':
                dataset['limitations'].append('Strata include only the top 50 reactions ranked across the full retained cohort, not a fresh top 50 under each filter.')
            if path.stem.startswith('adverse-reactions'):
                for row in dataset['data']:
                    row['coSuspectDrugs'] = None
            if path.stem == 'label-sections':
                documents = {}
                for row in dataset['data']:
                    row['text'] = 'Reference section in the linked product label. Full source text is retained in the local raw API cache; use the curated indication and interaction exports for project summaries.'
                    source_id = f"FDA-LABEL:{row['setId']}"
                    row['sourceIds'] = [source_id]
                    documents[source_id] = dict(id=source_id, name=f"{row['product']} product label",
                        url=f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={row['setId']}",
                        retrievedAt=dataset['sources'][0]['retrievedAt'], documentVersion=row['effectiveDate'] or 'unspecified')
                dataset['sources'].extend(documents.values())
                dataset['limitations'].append('Public entries index label sections and document versions; they do not reproduce the full prescribing text.')
            if path.stem == 'hyperkalaemia-coreported':
                dataset['limitations'].append('Counts raw co-reported drug names among reports mentioning hyperkalaemia/hyperkalemia; these are not established drug interactions.')
            if path.stem in ('indications', 'interactions'):
                pass
            elif path.stem in ('research-publications', 'trials', 'label-sections'):
                dataset['cohortDefinition'] = {
                    'research-publications': 'Unique PMIDs per topic and publication-date-year query; 2004–2025. Topic/year overlaps permitted.',
                    'trials': 'Unique NCT IDs with spironolactone in intervention names/other names; study starts 2004–2025 or missing start date.',
                    'label-sections': 'Retrieved current US Aldactone and Carospir label sections; not a structured approval or interaction comparison.',
                }[path.stem]
            else:
                dataset['cohortDefinition'] = 'Worldwide reports first received 2004–2025, same-entry spironolactone role 1, conservative single-ingredient match; conflicting duplicate IDs excluded.'
            validate(dataset)
            validate_rows(path.stem, dataset)
            datasets[path.stem] = dataset
    if completed != {'faers', 'trials', 'pubmed', 'labels'} or set(datasets) != set(SCHEMAS):
        raise ValueError('All four source extractions and every dataset must complete before publishing')
    partitions = next(m['faersPartitions'] for m in manifests if 'faersPartitions' in m)
    if set(partitions) != {str(y) for y in range(2004, 2026)}:
        raise ValueError('FAERS date partition coverage is incomplete')
    updates = {date for p in partitions.values() for date in p['updates']}
    if len(updates) != 1:
        raise ValueError('FAERS API update dates differ across partitions')
    cohort = next(m['cohortAudit'] for m in manifests if 'cohortAudit' in m)
    if sum(p['uniqueIds'] - p['excludedConflictingIds'] for p in partitions.values()) != cohort['candidates']:
        raise ValueError('Partition IDs do not reconcile to candidate cohort')
    if cohort['candidates'] != cohort['retained'] + sum(v for k, v in cohort.items() if k.startswith('excluded-')):
        raise ValueError('Cohort exclusions do not reconcile')
    summary = datasets['report-summary']
    if sum(r['reportCount'] for r in summary['data']) != summary['denominator']['count']:
        raise ValueError('Summary strata do not reconcile to cohort')
    totals = {r['preferredTerm']: r['reportCount'] for r in datasets['adverse-reactions']['data']}
    from collections import Counter
    strata = Counter()
    for row in datasets['adverse-reactions-filtered']['data']:
        strata[row['preferredTerm']] += row['reportCount']
    if len(strata) != min(50, len(totals)) or any(totals[t] != c for t, c in strata.items()):
        raise ValueError('Reaction strata do not reconcile to global totals')
    if key := os.getenv('OPENFDA_API_KEY'):
        if key in json.dumps([datasets, manifests]):
            raise ValueError('Secret detected in export metadata; publication stopped')
    target = ROOT / 'public' / 'data'
    index = []
    # Validation of every dataset finishes before any public file is changed.
    for name, dataset in datasets.items():
        dataset['data'].sort(key=lambda row: json.dumps(row, sort_keys=True))
        export(target, name, dataset)
        path = target / f'{name}.json'
        index.append({'name': name, 'rows': len(dataset['data']), 'bytes': path.stat().st_size,
                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    write_json(target / 'manifest.json', {'schemaVersion': '1.0', 'datasets': index})
    write_json(PIPE / 'clean' / 'phase-2-audit.json', {'snapshots': manifests, 'exports': index, 'mappingVersion': mapping['version']})
    print(f'Published {len(datasets)} validated JSON/CSV pairs')


if __name__ == '__main__':
    main()
