import { ArrowUpRight, Download } from 'lucide-react';
import type { Overview, EvidenceData } from '@/data/site-types';
import type { Dataset, Indication } from '@/data/types';
import type { JsonResource } from '@/hooks/useJson';
import { date, number, sourcePath } from '@/lib/format';

const repository = 'https://github.com/adarsh-gautam-sys/Spironolactone-Atlas';
const files = [
  'indications',
  'interactions',
  'adverse-reactions',
  'adverse-reactions-filtered',
  'report-summary',
  'usage',
  'seriousness-criteria',
  'reaction-outcomes',
  'hyperkalaemia-coreported',
  'research-publications',
  'trials',
  'label-sections',
];
export function Methods({
  data,
  labels,
  evidence,
}: {
  data: Overview;
  labels: JsonResource<Dataset<Indication>>;
  evidence: JsonResource<EvidenceData>;
}) {
  return (
    <>
      <section id="methods" className="atlas-section" data-chapter="methods">
        <div className="section-heading">
          <h2>
            Every observation
            <br />
            has a trail.
          </h2>
          <p>
            A frozen, reproducible snapshot. No live medical API calls, patient
            data collection or hidden clinical model.
          </p>
        </div>
        <div className="method-grid">
          <div>
            <h3>How this cohort was made</h3>
            <ol className="method-steps">
              <li>
                <strong>Retrieve.</strong> Full FDA receipt years 2004–2025;
                query and daily-count reconciliation logs retained.
              </li>
              <li>
                <strong>Resolve.</strong> Deduplicate report IDs and retain the
                selected latest version. Exclude conflicting equal-rank IDs.
              </li>
              <li>
                <strong>Filter.</strong> Match the same drug entry as a suspect,
                with a single-ingredient spironolactone name.
              </li>
              <li>
                <strong>Normalise.</strong> Count canonical case variants once
                within a report. Keep source terms and unknown values traceable.
              </li>
              <li>
                <strong>Publish.</strong> Export typed JSON/CSV with units,
                sources, dates, overlap rules and file hashes.
              </li>
            </ol>
            <a
              className="text-link"
              href={`${repository}/blob/main/data-pipeline/METHODOLOGY.md`}
              target="_blank"
              rel="noreferrer"
            >
              Read the full methodology <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="method-accordions">
            <details open>
              <summary>What these data cannot establish</summary>
              <p>
                FAERS cannot measure incidence or prove causality.
                Under-reporting, stimulated reporting, duplicate handling and
                source-selection bias remain. A report may list multiple
                medicines and reactions; a drug listing does not establish which
                medicine caused an event.
              </p>
              <p>
                Subgroup comparisons are unadjusted. Indication terms lack
                clinical qualifiers, research topics overlap, and editorial
                grades are not formal GRADE assessments.
              </p>
            </details>
            <details>
              <summary>Coverage and unresolved sources</summary>
              <p>
                Reporting window: 2004–2025, based on first FDA receipt.
                Retrieval snapshot: 3 November 2026. Complete retrieval does not
                prove exhaustive spelling/brand recall or complete spontaneous
                reporting.
              </p>
              <p>
                No verified India-specific label or licensed MedDRA SOC
                hierarchy is available. Abstract-only appraisals identify that
                limitation. Co-reported names are not a measured
                interaction-risk ranking.
              </p>
            </details>
            <details>
              <summary>Exact research queries and dates</summary>
              <div className="query-list">
                {data.queries.map((query, index) => (
                  <div key={`${query.sourceId}-${index}`}>
                    <strong>{query.sourceId}</strong>
                    <code>{query.query}</code>
                    <span>
                      {date(query.retrievedAt)} · Returned records:{' '}
                      {number(query.recordCount)}
                    </span>
                  </div>
                ))}
              </div>
              <p>
                Full reporting queries and filters are in the methodology and
                original dataset envelopes.
              </p>
            </details>
            <details>
              <summary>Reproduce the analysis</summary>
              <p>
                The repository contains offline Python extraction, curation and
                analysis scripts, counting rules and validation tests. Raw API
                responses and credentials stay outside the published website.
              </p>
              <a
                className="text-link"
                href={`${repository}/blob/main/data-pipeline/PIPELINE.md`}
              >
                Pipeline instructions <ArrowUpRight size={16} />
              </a>
            </details>
          </div>
        </div>
        <div className="downloads">
          <div>
            <h3>Take the data with you.</h3>
            <p>
              Source exports include metadata and limitations. CSV files contain
              the corresponding data rows.
            </p>
          </div>
          <a
            className="button small"
            href={sourcePath('manifest', 'json')}
            download
          >
            Export manifest <Download size={18} />
          </a>
          <ul>
            {files.map((name) => (
              <li key={name}>
                <span>{name.replaceAll('-', ' ')}</span>
                <a
                  href={sourcePath(name)}
                  download
                  aria-label={`Download ${name} CSV`}
                >
                  CSV <Download size={14} />
                </a>
                <a
                  href={sourcePath(name, 'json')}
                  download
                  aria-label={`Download ${name} JSON`}
                >
                  JSON
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section
        id="sources"
        className="atlas-section references"
        data-chapter="sources"
      >
        <div className="section-heading">
          <h2>Read the sources.</h2>
          <p>
            The data are a starting point for scrutiny. Read the named product
            document and the question each study actually addressed.
          </p>
        </div>
        <ul className="reference-list">
          {[
            data.source,
            ...data.researchSources,
            ...(labels.data?.sources ?? []),
          ].map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.name}
                <ArrowUpRight size={18} />
              </a>
              <span>
                Retrieved {date(source.retrievedAt)}
                {source.documentVersion
                  ? ` · Version ${source.documentVersion}`
                  : ''}
              </span>
            </li>
          ))}
          {evidence.data?.sources.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.id}
                <ArrowUpRight size={18} />
              </a>
              <span>
                {source.scope} · Reviewed{' '}
                {date(evidence.data?.reviewedAt ?? '2026-11-03')}
              </span>
            </li>
          ))}
        </ul>
        {(labels.error || evidence.error) && (
          <p className="load-error">
            Some reference details could not be loaded. Individual data files
            and appraisals retain their source links.
          </p>
        )}
        <div className="closing">
          <h3>Education, with limits.</h3>
          <p>
            This project is for education only. It is not medical advice. Do not
            start, stop or change any medicine without a doctor or pharmacist.
          </p>
          <div>
            <span>Snapshot · 3 November 2026</span>
            <a href={repository} target="_blank" rel="noreferrer">
              Project & source code <ArrowUpRight size={16} />
            </a>
            <a href="#top">Back to top</a>
          </div>
        </div>
      </section>
    </>
  );
}
