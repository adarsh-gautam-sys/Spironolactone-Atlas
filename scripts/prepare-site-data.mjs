import { readFile, writeFile, copyFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const dataset = (name) => read(`public/data/${name}.json`);
const [
  analysis,
  reactions,
  summary,
  criteria,
  outcomes,
  usage,
  coreported,
  publications,
  trials,
  evidence,
] = await Promise.all([
  read('data-pipeline/clean/phase-3-analysis.json'),
  dataset('adverse-reactions'),
  dataset('report-summary'),
  dataset('seriousness-criteria'),
  dataset('reaction-outcomes'),
  dataset('usage'),
  dataset('hyperkalaemia-coreported'),
  dataset('research-publications'),
  dataset('trials'),
  read('data-pipeline/clean/evidence-appraisal.json'),
]);
const cohort = summary.denominator.count;
assert.equal(
  summary.data.reduce((sum, row) => sum + row.reportCount, 0),
  cohort,
);
assert.equal(analysis.cohortReports, cohort);
const missing = analysis.recordLevel.counts['no-informative-indication'];
assert(missing >= 0 && missing <= cohort);
const ranked = (rows, label) =>
  rows
    .map((row) => ({ label: row[label] ?? 'Unknown', value: row.reportCount }))
    .sort((a, b) => b.value - a.value);
const overview = {
  schemaVersion: '1.0',
  generatedAt: analysis.generatedAt,
  source: reactions.sources[0],
  cohort,
  missingIndication: missing,
  window: { start: 2004, end: 2025 },
  topReactions: ranked(reactions.data, 'preferredTerm').slice(0, 20),
  marginals: Object.fromEntries(
    Object.entries(analysis.marginals).map(([key, rows]) => [
      key,
      rows.map((row) => ({
        label: String(row.value ?? 'Unknown'),
        value: row.reportCount,
      })),
    ]),
  ),
  criteria: ranked(criteria.data, 'criterion'),
  outcomes: ranked(outcomes.data, 'outcome'),
  indicationTerms: ranked(
    usage.data.filter(
      (row) =>
        !analysis.usageScreening.unknownTerms.includes(row.reportedIndication),
    ),
    'reportedIndication',
  ).slice(0, 12),
  coreported: ranked(coreported.data, 'reportedDrug').slice(0, 12),
  reactionGroupRates: analysis.reactionGroupRates,
  research: analysis.research.map((row) => ({
    topic: row.topic,
    countsByYear: row.countsByYear,
  })),
  trialStatuses: Object.entries(analysis.trials.statusCounts).map(
    ([label, value]) => ({ label, value }),
  ),
  trialPhases: [
    ...new Set(
      trials.data.flatMap((row) =>
        row.phases.length ? row.phases : ['NOT_RECORDED'],
      ),
    ),
  ].map((label) => ({
    label,
    value: trials.data.filter((row) =>
      label === 'NOT_RECORDED'
        ? row.phases.length === 0
        : row.phases.includes(label),
    ).length,
  })),
  trialCount: trials.data.length,
  researchSources: [...publications.sources, ...trials.sources],
  queries: [...publications.queries, ...trials.queries].map(
    ({ query, sourceId, retrievedAt, recordCount }) => ({
      query,
      sourceId,
      retrievedAt,
      recordCount,
    }),
  ),
};
assert.equal(overview.topReactions[0].label, 'hyperkalaemia');
assert.equal(overview.topReactions[0].value, 3452);
for (const dimension of ['sex', 'ageBand', 'seriousness', 'reportYear'])
  assert.equal(
    overview.marginals[dimension].reduce((sum, row) => sum + row.value, 0),
    cohort,
  );
assert.equal(
  overview.trialStatuses.reduce((sum, row) => sum + row.value, 0),
  trials.data.length,
);
assert(
  evidence.data.every((row) =>
    evidence.sources.some((source) => row.sourceIds.includes(source.id)),
  ),
);
await writeFile('public/data/atlas-overview.json', JSON.stringify(overview));
await copyFile(
  'data-pipeline/clean/evidence-appraisal.json',
  'public/data/evidence-appraisal.json',
);
console.log(
  `Prepared overview: ${cohort.toLocaleString('en-GB')} reports; ${evidence.data.length} appraisals. Source totals reconciled.`,
);
