import { useMemo, useState } from 'react';
import type { Overview } from '@/data/site-types';
import type { Dataset, AdverseReaction, ReportSummary } from '@/data/types';
import { useJson } from '@/hooks/useJson';
import { Bars } from '@/components/charts/Bars';
import { ChartBlock } from '@/components/charts/ChartBlock';
import { LinePlot } from '@/components/charts/LinePlot';
import { LoadState } from '@/sections/Evidence';
import { filterReports } from '@/lib/reporting';
import { number, percent, title } from '@/lib/format';

export function Reporting({ data }: { data: Overview }) {
  const [explore, setExplore] = useState(false);
  const source = [data.source];
  const completeness = [
    { label: 'No informative indication', value: data.missingIndication },
    {
      label: 'Informative indication recorded',
      value: data.cohort - data.missingIndication,
    },
  ];
  const years = [...data.marginals.reportYear].sort(
    (a, b) => Number(a.label) - Number(b.label),
  );
  const criteriaNames: Record<string, string> = {
    seriousnesscongenitalanomali: 'Congenital anomaly',
    seriousnessdeath: 'Death flag',
    seriousnessdisabling: 'Disability',
    seriousnesshospitalization: 'Hospitalisation',
    seriousnesslifethreatening: 'Life-threatening',
    seriousnessother: 'Other serious criterion',
  };
  const criteria = data.criteria.map((row) => ({
    ...row,
    label: criteriaNames[row.label] ?? row.label,
  }));
  const outcomeNames: Record<string, string> = {
    '1': 'Recovered / resolved',
    '2': 'Recovering / resolving',
    '3': 'Not recovered / not resolved',
    '4': 'Resolved with sequelae',
    '5': 'Fatal',
    '6': 'Unknown',
  };
  const outcomeSource = {
    id: 'FDA-OUTCOME-CODES',
    name: 'FDA reaction-outcome coding',
    url: 'https://www.fda.gov/media/76278/download',
    retrievedAt: '2026-11-03',
  };
  const outcomes = data.outcomes.map((row) => ({
    ...row,
    label:
      row.label === 'Unknown'
        ? 'Not recorded'
        : `${outcomeNames[row.label] ?? 'Unrecognised code'} (${row.label})`,
  }));
  return (
    <section id="reporting" className="atlas-section" data-chapter="reporting">
      <div className="section-heading">
        <h2>
          Reports are observations.
          <br />
          The limits belong in view.
        </h2>
        <p>
          A selected cohort of {number(data.cohort)} same-entry suspect,
          single-ingredient reports. The denominator is reports—not people
          prescribed spironolactone.
        </p>
      </div>
      <div className="completeness-story">
        <ChartBlock
          title="What is missing from the indication field?"
          takeaway={`${percent(data.missingIndication, data.cohort)} of reports have no informative indication. This prevents a reliable off-label prescribing-share estimate.`}
          rows={completeness}
          sources={source}
          denominator={data.cohort}
          note="Report-level union, not a sum of blank/unknown source terms."
        >
          <div
            className="completeness-bar"
            role="img"
            aria-label={completeness
              .map((row) => `${row.label}: ${number(row.value)}`)
              .join('; ')}
          >
            <span
              style={{
                flex: data.missingIndication / data.cohort,
              }}
            />
            <span style={{ flex: 1 - data.missingIndication / data.cohort }} />
          </div>
          <div className="completeness-key">
            {completeness.map((row) => (
              <span key={row.label}>
                <strong>{percent(row.value, data.cohort)}</strong>
                {row.label}
              </span>
            ))}
          </div>
        </ChartBlock>
      </div>
      <div className="two-column">
        <ChartBlock
          title="Which indication terms are recorded?"
          takeaway="These are source terms, with overlapping categories and unverified clinical qualifiers. They are not a prescribing distribution."
          rows={data.indicationTerms.slice(0, 8)}
          sources={source}
          denominator={data.cohort}
          download="usage"
        >
          <Bars rows={data.indicationTerms.slice(0, 8)} />
        </ChartBlock>
        <ChartBlock
          title="Which reaction terms lead the cohort?"
          takeaway="A report can contain several reaction terms. Frequency does not establish which drug caused an event."
          rows={data.topReactions.slice(0, 8)}
          sources={source}
          denominator={data.cohort}
          download="adverse-reactions"
        >
          <Bars rows={data.topReactions.slice(0, 8)} />
        </ChartBlock>
      </div>
      <div className="explorer-prompt">
        <div>
          <h3>Look within the reporting groups.</h3>
          <p>
            Compare recorded sex, age and seriousness while keeping the subgroup
            denominator visible.
          </p>
        </div>
        {!explore && (
          <button className="button small" onClick={() => setExplore(true)}>
            Load subgroup explorer
          </button>
        )}
      </div>
      {explore && <SubgroupExplorer />}
      <div className="two-column">
        <ChartBlock
          title="Reports through time"
          takeaway="Annual report receipt counts reflect reporting activity, not changes in treatment risk."
          rows={years}
          sources={source}
          denominator={data.cohort}
          download="report-summary"
        >
          <LinePlot rows={years} />
        </ChartBlock>
        <ChartBlock
          title="Who appears in the age field?"
          takeaway="Age is missing in part of the cohort. Recorded age bands describe the reports, not the treated population."
          rows={data.marginals.ageBand}
          sources={source}
          denominator={data.cohort}
          download="report-summary"
        >
          <Bars rows={data.marginals.ageBand} />
        </ChartBlock>
        <ChartBlock
          title="Recorded sex"
          takeaway="Unknown entries remain visible. These counts do not establish differences in exposure or risk."
          rows={data.marginals.sex}
          sources={source}
          denominator={data.cohort}
          download="report-summary"
        >
          <Bars rows={data.marginals.sex} />
        </ChartBlock>
        <ChartBlock
          title="Report-level seriousness"
          takeaway="Seriousness is a report classification, not proof of harm attributable to spironolactone."
          rows={data.marginals.seriousness}
          sources={source}
          denominator={data.cohort}
          download="report-summary"
        >
          <Bars rows={data.marginals.seriousness} />
        </ChartBlock>
        <ChartBlock
          title="Seriousness criteria can overlap"
          takeaway="One report may meet several criteria. A death flag is not drug-attributable mortality."
          rows={criteria}
          sources={source}
          denominator={data.cohort}
          note="Overlapping report-level flags; do not add categories."
          download="seriousness-criteria"
        >
          <Bars rows={criteria} />
        </ChartBlock>
        <ChartBlock
          title="Reaction outcomes are a separate field"
          takeaway="These source-coded outcomes belong to reactions, not report-level seriousness. One report may contribute to more than one category."
          rows={outcomes}
          sources={[...source, outcomeSource]}
          denominator={data.cohort}
          note="Reaction-outcome codes retained in parentheses; categories can overlap. Fatal outcomes are not drug-attributable mortality."
          download="reaction-outcomes"
        >
          <Bars rows={outcomes} />
        </ChartBlock>
      </div>
      <div className="source-gap">
        <h3>Why there is no organ-system body map</h3>
        <p>
          A licensed, versioned MedDRA hierarchy is not available for this
          project. Reaction terms are shown directly; no organ mapping has been
          invented.
        </p>
      </div>
    </section>
  );
}
function SubgroupExplorer() {
  const reactions = useJson<Dataset<AdverseReaction>>(
    'adverse-reactions-filtered',
  );
  const summary = useJson<Dataset<ReportSummary>>('report-summary');
  const [filters, setFilters] = useState({
    sex: 'all',
    seriousness: 'all',
    ageBand: 'all',
  });
  const result = useMemo(
    () =>
      reactions.data && summary.data
        ? filterReports(reactions.data.data, summary.data.data, filters)
        : null,
    [reactions.data, summary.data, filters],
  );
  const controls: [keyof typeof filters, string, string[]][] = [
    ['sex', 'Recorded sex', ['female', 'male', 'unknown']],
    [
      'seriousness',
      'Report seriousness',
      ['serious', 'non-serious', 'unknown'],
    ],
    [
      'ageBand',
      'Age band',
      ['<18', '18–44', '45–64', '65–74', '75+', 'unknown'],
    ],
  ];
  return (
    <div className="subgroup-explorer">
      <div className="filters">
        {controls.map(([key, label, values]) => (
          <label key={key}>
            {label}
            <select
              value={filters[key]}
              onChange={(event) =>
                setFilters({ ...filters, [key]: event.target.value })
              }
            >
              <option value="all">All</option>
              {values.map((value) => (
                <option value={value} key={value}>
                  {title(value)}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button
          className="text-button"
          onClick={() =>
            setFilters({ sex: 'all', seriousness: 'all', ageBand: 'all' })
          }
        >
          Reset filters
        </button>
      </div>
      {result && reactions.data ? (
        <>
          <p className="result-count" role="status">
            {number(result.denominator)} reports match this combination.
          </p>
          <ChartBlock
            title="Reaction terms within this group"
            takeaway="Counts and rankings are restricted to the 20 leading terms selected from the full cohort. Comparisons are unadjusted reporting observations."
            rows={result.rows.slice(0, 10)}
            sources={reactions.data.sources}
            denominator={result.denominator}
            download="adverse-reactions-filtered"
          >
            <Bars rows={result.rows.slice(0, 10)} />
          </ChartBlock>
          {!result.denominator && (
            <p className="empty-state">
              There are no reports in this subgroup. Try a broader selection.
            </p>
          )}
        </>
      ) : (
        <LoadState
          error={reactions.error ?? summary.error}
          retry={() => {
            reactions.retry();
            summary.retry();
          }}
          label="subgroup datasets"
        />
      )}
    </div>
  );
}
