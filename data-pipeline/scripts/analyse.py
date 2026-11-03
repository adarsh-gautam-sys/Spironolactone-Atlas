"""Reproduce Phase 3 descriptive findings from validated exports and cached reports."""
import csv
import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from pipeline import Client, PIPE, ROOT, extract_faers, matching, normalize, product_kind, reaction_term, write_json

UNKNOWN = {'', 'unknown', 'unknown indication', 'product used for unknown indication',
           'drug use for unknown indication', 'not reported', 'none', 'ill defined disorder'}
LABEL_TOPICS = {'hypertension', 'essential hypertension', 'cardiac failure', 'cardiac failure congestive',
                'cardiac failure chronic', 'ascites', 'hepatic cirrhosis', 'nephrotic syndrome',
                'hyperaldosteronism', 'primary hyperaldosteronism'}
OUTSIDE_TOPICS = {'acne', 'acne vulgaris', 'hirsutism', 'alopecia', 'androgenetic alopecia',
                  'hidradenitis', 'hidradenitis suppurativa', 'polycystic ovary syndrome',
                  'central serous chorioretinopathy', 'premenstrual syndrome', 'proteinuria',
                  'heart failure with preserved ejection fraction'}


def usage_profile(terms):
    terms = {normalize(t) for t in terms}
    informative = terms - UNKNOWN
    states = set()
    for term in informative:
        states.add('outside-reference-label-topic' if term in OUTSIDE_TOPICS else
                   'label-topic-needs-qualifiers' if term in LABEL_TOPICS else 'unresolved-topic')
    return informative, states


def record_metrics(records):
    counts = Counter()
    categories = Counter()
    topics = Counter()
    for report in records:
        suspects = [d for d in report.get('patient', {}).get('drug', [])
                    if matching(d) and str(d.get('drugcharacterization')) == '1']
        if not suspects or {product_kind(d) for d in suspects} != {'single'}:
            continue
        counts['reports'] += 1
        terms = {normalize(d.get('drugindication')) for d in suspects}
        informative, states = usage_profile(terms)
        counts['no-informative-indication'] += not bool(informative)
        counts['any-blank-indication'] += '' in terms
        counts['any-explicit-unknown-indication'] += bool(terms & (UNKNOWN - {''}))
        counts['any-outside-reference-label-topic'] += 'outside-reference-label-topic' in states
        categories[' + '.join(sorted(states)) or 'no-informative-indication'] += 1
        topics.update(informative)
        reactions = {reaction_term(r.get('reactionmeddrapt')) for r in report.get('patient', {}).get('reaction', [])}
        counts['hyperkalaemia-spelling-union'] += bool(reactions & {'hyperkalaemia', 'hyperkalemia'})
    assert sum(categories.values()) == counts['reports']
    return {'counts': dict(counts), 'usageCategories': dict(categories), 'indicationTerms': dict(topics)}


def load(name):
    directory = ROOT / 'public' / 'data'
    manifest = json.loads((directory/'manifest.json').read_text(encoding='utf-8'))
    expected = next(item for item in manifest['datasets'] if item['name'] == name)
    raw = (directory/f'{name}.json').read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected['sha256']:
        raise ValueError(f'{name}: export hash differs from manifest')
    return json.loads(raw)


def rate(count, denominator):
    return round(100 * count / denominator, 3) if denominator else None


def summarise(record_stats):
    summary = load('report-summary')
    n = summary['denominator']['count']
    assert record_stats['counts']['reports'] == n
    marginals = {}
    for dimension in ['sex', 'ageBand', 'seriousness', 'reportYear', 'country']:
        counter = Counter()
        for row in summary['data']:
            counter[row[dimension]] += row['reportCount']
        assert sum(counter.values()) == n
        marginals[dimension] = [{'value': key, 'reportCount': count, 'percentOfCohort': rate(count, n)} for key, count in counter.most_common()]
    reactions = sorted(load('adverse-reactions')['data'], key=lambda r: (-r['reportCount'], r['preferredTerm']))
    top = [dict(term=r['preferredTerm'], reportCount=r['reportCount'], percentOfCohort=rate(r['reportCount'], n)) for r in reactions[:20]]
    stratified = load('adverse-reactions-filtered')['data']
    group_rates = []
    for field in ['sex', 'ageBand']:
        denominators = {r['value']: r['reportCount'] for r in marginals[field]}
        for term in [r['term'] for r in top[:5]]:
            counts = Counter()
            for row in stratified:
                if row['preferredTerm'] == term:
                    counts[row[field]] += row['reportCount']
            assert sum(counts.values()) == next(r['reportCount'] for r in top if r['term'] == term)
            for key, denominator in denominators.items():
                group_rates.append(dict(term=term, dimension=field, group=key, reportCount=counts[key],
                                        denominator=denominator, percentWithinReportedGroup=rate(counts[key], denominator)))
    publication = defaultdict(dict)
    for row in load('research-publications')['data']:
        publication[row['condition']][row['year']] = row['publicationCount']
    research = []
    for topic, years in publication.items():
        early = sum(years.get(y, 0) for y in range(2004, 2009))
        recent = sum(years.get(y, 0) for y in range(2021, 2026))
        research.append(dict(topic=topic, countsByYear=years, early2004to2008=early, recent2021to2025=recent,
                             absoluteChange=recent-early, ratio=round(recent/early, 3) if early else None))
    trials = load('trials')['data']
    trial_counts = Counter(row['status'] or 'unknown' for row in trials)
    return dict(schemaVersion='1.0', generatedAt=datetime.now(timezone.utc).isoformat(), cohortReports=n,
        source='openFDA drug events; receivedate 2004–2025; API update 2026-10-28; retrieved 2026-11-03',
        sourceManifestSha256=hashlib.sha256((ROOT/'public/data/manifest.json').read_bytes()).hexdigest(),
        limitations=['Descriptive reporting proportions, not incidence, causal risk or prescribing prevalence.',
                    'Current label-topic screening is relative to US Aldactone tablets, not the actual country/date of prescribing.',
                    'Non-random reporting and missingness preclude population generalisation; no sampling confidence intervals or causal tests applied.',
                    'Capitalization/whitespace normalized per report; historical MedDRA synonyms remain distinct without a licensed hierarchy.'],
        marginals=marginals, topReactions=top, reactionGroupRates=group_rates, recordLevel=record_stats,
        usageScreening=dict(referenceProduct='US Aldactone tablets, label revised 11/2025',
            sourceLabelUrl='https://labeling.pfizer.com/showlabeling.aspx?id=520',
            unknownTerms=sorted(UNKNOWN), labelTopicTerms=sorted(LABEL_TOPICS), outsideTopicTerms=sorted(OUTSIDE_TOPICS),
            method='Exact normalized English source terms only; topic screen is not a regulatory adjudication or exhaustive mapping'),
        research=research, trials=dict(retainedStudies=len(trials), statusCounts=dict(trial_counts),
                                    missingStartYear=sum(r['startYear'] is None for r in trials)))


def figures(result):
    directory = ROOT / 'docs' / 'figures'
    directory.mkdir(exist_ok=True)
    plt.rcParams.update({'font.size': 10, 'axes.spines.top': False, 'axes.spines.right': False})
    fig, ax = plt.subplots(2, 2, figsize=(14, 10), layout='constrained')
    rows = result['topReactions'][:10][::-1]
    ax[0, 0].barh([r['term'] for r in rows], [r['reportCount'] for r in rows], color='#275a76')
    ax[0, 0].set(title='Most frequent reported reaction terms', xlabel='Distinct retained reports mentioning term', ylabel='Reported term')
    years = sorted(result['marginals']['reportYear'], key=lambda r: r['value'])
    ax[0, 1].plot([r['value'] for r in years], [r['reportCount'] for r in years], marker='o', color='#275a76')
    ax[0, 1].set(title='Reports by first FDA receipt year', xlabel='First-receipt year', ylabel='Retained reports')
    ax[0, 1].set_ylim(bottom=0)
    dims = [('Age', 'ageBand', None), ('Sex', 'sex', 'unknown'), ('Country', 'country', None)]
    missing = [next(r['percentOfCohort'] for r in result['marginals'][d] if r['value'] == unknown) for _, d, unknown in dims]
    missing.append(rate(result['recordLevel']['counts']['no-informative-indication'], result['cohortReports']))
    ax[1, 0].bar([label for label, _, _ in dims]+['Indication\n(no informative term)'], missing, color='#707b83')
    ax[1, 0].set(title='Unknown or unusable reported fields', xlabel='Reported field', ylabel='Percent of retained reports', ylim=(0, 100))
    for r in sorted(result['research'], key=lambda r:-r['recent2021to2025'])[:3]:
        ys = sorted(int(y) for y in r['countsByYear'])
        ax[1, 1].plot(ys, [r['countsByYear'][y] for y in ys], label=r['topic'])
    ax[1, 1].set(title='Publication search counts: three largest recent topics', xlabel='Publication-date year', ylabel='PMIDs returned by topic/year query')
    ax[1, 1].legend(fontsize=8)
    fig.suptitle(f"Spironolactone Atlas — analytical draft; {result['cohortReports']:,} retained reports", fontsize=15)
    fig.supxlabel('Sources: openFDA + PubMed; 2004–2025; retrieved 3 Nov 2026. Reporting and discovery counts are not incidence or efficacy.', fontsize=9)
    fig.savefig(directory/'phase-3-overview.png', dpi=160, bbox_inches='tight', pad_inches=.18)
    fig.savefig(directory/'phase-3-overview.svg', bbox_inches='tight', pad_inches=.18)
    svg = directory/'phase-3-overview.svg'
    svg.write_text('\n'.join(line.rstrip() for line in svg.read_text(encoding='utf-8').splitlines())+'\n', encoding='utf-8')
    plt.close(fig)


def main():
    client = Client(PIPE/'raw/phase-2/2026-11-03-faers', offline=True)
    result = summarise(record_metrics(extract_faers(client)))
    write_json(PIPE/'clean/phase-3-analysis.json', result)
    figures(result)
    rows = result['reactionGroupRates']
    with (PIPE/'clean/phase-3-group-rates.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
    print(json.dumps({'N': result['cohortReports'], 'recordMetrics': result['recordLevel']['counts'],
                      'topReactions': result['topReactions'][:5]}, ensure_ascii=True), flush=True)


if __name__ == '__main__':
    main()
