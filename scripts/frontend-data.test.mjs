import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterReports } from '../src/lib/reporting.ts';
const read = async (name) =>
  JSON.parse(await readFile(`public/data/${name}.json`, 'utf8'));
test('subgroup filter uses the same dimensions for reactions and denominator', () => {
  const summary = [
    {
      sex: 'female',
      seriousness: 'serious',
      ageBand: '45–64',
      reportCount: 10,
    },
    { sex: 'male', seriousness: 'serious', ageBand: '45–64', reportCount: 20 },
    { sex: 'female', seriousness: 'serious', ageBand: null, reportCount: 3 },
  ];
  const reactions = [
    { ...summary[0], preferredTerm: 'term a', reportCount: 2 },
    { ...summary[0], preferredTerm: 'term a', reportCount: 1 },
    { ...summary[1], preferredTerm: 'term a', reportCount: 7 },
    { ...summary[2], preferredTerm: 'term b', reportCount: 1 },
  ];
  assert.deepEqual(
    filterReports(reactions, summary, {
      sex: 'female',
      seriousness: 'serious',
      ageBand: '45–64',
    }),
    { denominator: 10, rows: [{ label: 'term a', value: 3 }] },
  );
  assert.deepEqual(
    filterReports(reactions, summary, {
      sex: 'all',
      seriousness: 'all',
      ageBand: 'unknown',
    }),
    { denominator: 3, rows: [{ label: 'term b', value: 1 }] },
  );
  assert.deepEqual(
    filterReports(reactions, summary, {
      sex: 'male',
      seriousness: 'non-serious',
      ageBand: 'all',
    }),
    { denominator: 0, rows: [] },
  );
});
test('published overview reconciles with the frozen source exports', async () => {
  const [overview, summary, reactions, filtered] = await Promise.all(
    [
      'atlas-overview',
      'report-summary',
      'adverse-reactions',
      'adverse-reactions-filtered',
    ].map(read),
  );
  assert.equal(overview.cohort, summary.denominator.count);
  assert.equal(
    overview.cohort,
    summary.data.reduce((sum, row) => sum + row.reportCount, 0),
  );
  const all = filterReports(filtered.data, summary.data, {
    sex: 'all',
    seriousness: 'all',
    ageBand: 'all',
  });
  for (const row of overview.topReactions) {
    assert.equal(
      reactions.data.find((item) => item.preferredTerm === row.label)
        ?.reportCount,
      row.value,
    );
    assert.equal(
      all.rows.find((item) => item.label === row.label)?.value,
      row.value,
    );
  }
  for (const sex of ['female', 'male', 'unknown'])
    for (const ageBand of [
      'all',
      '<18',
      '18–44',
      '45–64',
      '65–74',
      '75+',
      'unknown',
    ]) {
      const group = filterReports(filtered.data, summary.data, {
        sex,
        ageBand,
        seriousness: 'all',
      });
      assert(group.rows.every((row) => row.value <= group.denominator));
    }
  assert.equal(overview.missingIndication, 12955);
});
test('every appraisal has resolvable citations and interaction severity remains ungraded', async () => {
  const [evidence, interactions] = await Promise.all(
    ['evidence-appraisal', 'interactions'].map(read),
  );
  for (const row of evidence.data) {
    assert(row.applicability);
    assert(row.biasAndPrecision);
    assert(
      row.sourceIds.every((id) =>
        evidence.sources.some((source) => source.id === id),
      ),
    );
  }
  assert(interactions.data.every((row) => row.severity === null));
});
