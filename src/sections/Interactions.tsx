import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpRight, Search } from 'lucide-react';
import type { Dataset, Interaction } from '@/data/types';
import type { Overview } from '@/data/site-types';
import type { JsonResource } from '@/hooks/useJson';
import { LoadState } from '@/sections/Evidence';
import { ChartBlock } from '@/components/charts/ChartBlock';
import { Bars } from '@/components/charts/Bars';
import { SourceNote } from '@/components/ui/SourceNote';
import { number, percent, sourcePath, title } from '@/lib/format';

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, Interaction>();
const columns = helper.columns([
  helper.accessor('drugOrClass', { header: 'Drug / class' }),
  helper.accessor('effect', { header: 'Label-derived effect' }),
  helper.accessor('managementNote', { header: 'Source note' }),
]);
export function Interactions({
  data,
  dataset,
}: {
  data: Overview;
  dataset: JsonResource<Dataset<Interaction>>;
}) {
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);
  const filtered = useMemo(
    () =>
      (dataset.data?.data ?? [])
        .filter((row) =>
          `${row.drugOrClass} ${row.effect}`
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
        )
        .sort(
          (a, b) =>
            (ascending ? 1 : -1) * a.drugOrClass.localeCompare(b.drugOrClass),
        ),
    [dataset.data, search, ascending],
  );
  const table = useTable({ features, columns, data: filtered });
  const subgroupRows = data.reactionGroupRates.filter(
    (row) => row.term === 'hyperkalaemia' && row.dimension === 'sex',
  );
  return (
    <section
      id="interactions"
      className="atlas-section"
      data-chapter="interactions"
    >
      <div className="section-heading">
        <h2>
          Hyperkalaemia.
          <br />
          Read the context.
        </h2>
        <p>
          The leading reaction term appears in{' '}
          {number(data.topReactions[0]?.value ?? 0)} selected reports (
          {percent(data.topReactions[0]?.value ?? 0, data.cohort)}). This is a
          reporting share, not the chance that a patient will experience it.
        </p>
      </div>
      <div className="two-column">
        <ChartBlock
          title="Within recorded sex groups"
          takeaway="Each share uses its own group denominator. Differences are unadjusted and may reflect disease, exposure, co-treatment and reporting patterns."
          rows={subgroupRows.map((row) => ({
            label: `${title(row.group ?? 'Unknown')} · ${number(row.reportCount)} / ${number(row.denominator)} reports`,
            value: row.percentWithinReportedGroup,
          }))}
          sources={[data.source]}
          unit="Percent of subgroup"
          note="Values describe hyperkalaemia-term reports within each recorded sex group."
        >
          <div className="rate-comparison">
            {subgroupRows.map((row) => (
              <div key={row.group}>
                <div>
                  <span>{title(row.group ?? 'Unknown')}</span>
                  <strong>{row.percentWithinReportedGroup.toFixed(1)}%</strong>
                </div>
                <meter
                  min={0}
                  max={100}
                  value={row.percentWithinReportedGroup}
                  aria-label={`${row.group ?? 'Unknown'}: ${row.percentWithinReportedGroup.toFixed(1)} percent`}
                />
                <span className="caption">
                  {number(row.reportCount)} of {number(row.denominator)} reports
                </span>
              </div>
            ))}
          </div>
        </ChartBlock>
        <ChartBlock
          title="Drug names co-reported with the term"
          takeaway="These are raw reported names, with unresolved brand aliases. They are not independent risk factors or a measured interaction ranking."
          rows={data.coreported.slice(0, 6)}
          sources={[data.source]}
          denominator={data.topReactions[0]?.value}
          note="Denominator: hyperkalaemia-term reports; source CSV envelope retains the full cohort denominator."
          download="hyperkalaemia-coreported"
        >
          <Bars rows={data.coreported.slice(0, 6)} />
        </ChartBlock>
      </div>
      <div className="interaction-reference">
        <div className="subsection-heading">
          <h3>A separate, label-derived reference.</h3>
          <p>
            Interaction information below comes from the named Carospir product
            label. It is separate from the co-reported drug names above and is
            not an exhaustive prescribing reference.
          </p>
        </div>
        <div className="filters">
          <label>
            Search drug or effect
            <span className="search-field">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. lithium or potassium"
              />
            </span>
          </label>
          <a className="text-link" href={sourcePath('interactions')} download>
            Download CSV
          </a>
        </div>
        {dataset.data ? (
          <>
            <p className="result-count" role="status">
              {filtered.length} of {dataset.data.data.length} entries · Severity
              not graded in this extract
            </p>
            <div
              className="table-scroll"
              role="region"
              aria-label="Label-derived interactions"
              tabIndex={0}
            >
              <table className="interaction-table">
                <caption className="sr-only">
                  Searchable interaction summaries from the Carospir US label
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      aria-sort={ascending ? 'ascending' : 'descending'}
                    >
                      <button onClick={() => setAscending((value) => !value)}>
                        Drug / class{' '}
                        {ascending ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )}
                      </button>
                    </th>
                    <th scope="col">Label-derived effect</th>
                    <th scope="col">Source note</th>
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.original.id}>
                      <th scope="row">{row.original.drugOrClass}</th>
                      <td>{row.original.effect}</td>
                      <td>
                        {row.original.managementNote ??
                          'Consult the full product label.'}
                        <a
                          className="row-source"
                          href={
                            dataset.data?.sources.find((source) =>
                              row.original.sourceIds.includes(source.id),
                            )?.url
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Product label <ArrowUpRight size={13} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <p className="empty-state">
                No interactions match “{search}”.{' '}
                <button onClick={() => setSearch('')}>Clear search</button>
              </p>
            )}
            <SourceNote
              sources={dataset.data.sources.filter(
                (source) => source.id === 'US-CAROSPIR',
              )}
              note="US suspension product; reviewed sections 1 and 7. No severity ranking was inferred."
            />
          </>
        ) : (
          <LoadState
            error={dataset.error}
            retry={dataset.retry}
            label="interaction reference"
          />
        )}
      </div>
    </section>
  );
}
