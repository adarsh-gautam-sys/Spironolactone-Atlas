import { useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { JsonResource } from '@/hooks/useJson';
import type { Dataset, Indication } from '@/data/types';
import type { Appraisal, EvidenceData } from '@/data/site-types';
import { SourceNote } from '@/components/ui/SourceNote';
import { appraisalDirection, date, topicName } from '@/lib/format';

const focuses: Record<string, string> = {
  acne: 'Skin & hair',
  'hair-loss': 'Skin & hair',
  hidradenitis: 'Skin & hair',
  'hirsutism-pcos': 'Endocrine',
  'gender-affirming': 'Endocrine',
  hfpef: 'Cardiovascular',
  'resistant-hypertension': 'Cardiovascular',
  'proteinuria-ckd': 'Renal',
  'central-serous': 'Eye',
  'pms-pmdd': 'Reproductive',
};
export function Evidence({
  labels,
  evidence,
}: {
  labels: JsonResource<Dataset<Indication>>;
  evidence: JsonResource<EvidenceData>;
}) {
  const [product, setProduct] = useState('US-ALDACTONE');
  const [grade, setGrade] = useState('all');
  const [focus, setFocus] = useState('all');
  const [selected, setSelected] = useState<Appraisal | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const visible =
    evidence.data?.data.filter(
      (item) =>
        (grade === 'all' || item.grade === grade) &&
        (focus === 'all' || focuses[item.topic] === focus),
    ) ?? [];
  const show = (item: Appraisal) => {
    setSelected(item);
    dialog.current?.showModal();
    if (dialog.current) dialog.current.scrollTop = 0;
  };
  const clearFilters = () => {
    setGrade('all');
    setFocus('all');
  };
  return (
    <section id="evidence" className="atlas-section" data-chapter="evidence">
      <div className="section-heading">
        <h2>
          One medicine.
          <br />
          Different questions.
        </h2>
        <p>
          A product label tells us where a medicine is authorised. Research asks
          what happens in a particular population. Neither can stand in for the
          other.
        </p>
      </div>
      <div className="label-comparison">
        <h3>Read the product, not just the country.</h3>
        <div className="segmented" aria-label="Reference product">
          {[
            ['US-ALDACTONE', 'US · Aldactone'],
            ['US-CAROSPIR', 'US · Carospir'],
            ['UK-ALDACTONE', 'UK · Aldactone'],
            ['India', 'India · source gap'],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={product === id}
              onClick={() => setProduct(id ?? 'US-ALDACTONE')}
            >
              {label}
            </button>
          ))}
        </div>
        {product === 'India' ? (
          <div className="source-gap">
            <h4>India-specific label not verified</h4>
            <p>
              No dated, India-specific product document is available in this
              snapshot. This is an unresolved source gap, not a finding that a
              use is unapproved.
            </p>
          </div>
        ) : labels.data ? (
          <>
            <ul className="indication-list">
              {labels.data.data
                .filter((item) => item.labelSourceId === product)
                .map((item) => (
                  <li key={item.id}>
                    {item.indicationText}
                    <span>
                      {item.population === 'unspecified'
                        ? 'Population qualifiers: see label'
                        : `Population: ${item.population}`}{' '}
                      · {item.referenceProduct}
                    </span>
                  </li>
                ))}
            </ul>
            <SourceNote
              sources={labels.data.sources.filter(
                (source) => source.id === product,
              )}
              note="Paraphrases of the named product document; consult the full label for eligibility and limitations."
            />
          </>
        ) : (
          <LoadState
            error={labels.error}
            retry={labels.retry}
            label="product labels"
          />
        )}
      </div>
      <div className="evidence-explorer">
        <div className="subsection-heading">
          <h3>Explore the appraised evidence.</h3>
          <p>
            Ten targeted appraisals. Grades are project editorial summaries, not
            formal GRADE assessments or clinical recommendations.
          </p>
        </div>
        <div className="filters">
          <label>
            Evidence grade
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            >
              <option value="all">All grades</option>
              <option value="A">A · Strong, scoped support</option>
              <option value="B">B · Moderate or mixed</option>
              <option value="C">C · Limited or emerging</option>
            </select>
          </label>
          <label>
            Clinical topic
            <select
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
            >
              <option value="all">All topics</option>
              {[...new Set(Object.values(focuses))].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          {(grade !== 'all' || focus !== 'all') && visible.length > 0 && (
            <button className="text-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
        <p className="caption">
          Clinical topic groups are editorial navigation, not MedDRA
          organ-system mappings.
        </p>
        {evidence.data ? (
          <>
            <p className="result-count" role="status">
              {visible.length} of {evidence.data.data.length} appraisals
            </p>
            <div className="evidence-grid">
              {visible.map((item) => (
                <button
                  className="evidence-item"
                  key={item.topic}
                  onClick={() => show(item)}
                >
                  <span className="evidence-topline">
                    <span className={`grade grade-${item.grade}`}>
                      Grade {item.grade}
                    </span>
                    <span className="evidence-direction">
                      {appraisalDirection(item.direction)}
                    </span>
                  </span>
                  <h4>{topicName(item.topic)}</h4>
                  <p>{item.question}</p>
                  <span className="evidence-action">
                    Read appraisal <ArrowUpRight size={18} />
                  </span>
                </button>
              ))}
            </div>
            {!visible.length && (
              <p className="empty-state">
                No appraisals match this combination.{' '}
                <button onClick={clearFilters}>Clear filters</button>
              </p>
            )}
            <p className="source-note">
              Appraisal date: {date(evidence.data.reviewedAt)} · Primary studies
              and official guidelines are linked in each appraisal. Publication
              activity is not a measure of evidence quality.
            </p>
            <details className="grade-key">
              <summary>What do the grades mean?</summary>
              <dl>
                {Object.entries(evidence.data.gradeDefinitions).map(
                  ([key, value]) => (
                    <div key={key}>
                      <dt>Grade {key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ),
                )}
              </dl>
            </details>
          </>
        ) : (
          <LoadState
            error={evidence.error}
            retry={evidence.retry}
            label="evidence appraisals"
          />
        )}
      </div>
      <dialog
        className="evidence-drawer"
        ref={dialog}
        aria-labelledby="appraisal-title"
      >
        <div className="drawer-header">
          <span>Evidence appraisal</span>
          <button
            aria-label="Close appraisal"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        {selected && (
          <>
            <div className="evidence-topline">
              <span className={`grade grade-${selected.grade}`}>
                Grade {selected.grade}
              </span>
              <span className="evidence-direction">
                {appraisalDirection(selected.direction)}
              </span>
            </div>
            <h2 id="appraisal-title">{topicName(selected.topic)}</h2>
            <p className="drawer-question">{selected.question}</p>
            <dl className="appraisal-fields">
              {[
                ['Study design', selected.design],
                ['Bias and precision', selected.biasAndPrecision],
                ['Population and applicability', selected.applicability],
                ['Interpretation', selected.interpretation],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3>Sources and scope</h3>
            {evidence.data?.sources
              .filter((source) => selected.sourceIds.includes(source.id))
              .map((source) => (
                <p className="appraisal-source" key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.id} <ArrowUpRight size={16} />
                  </a>
                  <span>{source.scope}</span>
                </p>
              ))}
            <p className="source-note">
              Reviewed {evidence.data && date(evidence.data.reviewedAt)} · A
              targeted appraisal, not an exhaustive systematic review. Grade and
              regulatory approval are separate.
            </p>
          </>
        )}
      </dialog>
    </section>
  );
}
export function LoadState({
  error,
  retry,
  label,
}: {
  error: string | null;
  retry: () => void;
  label: string;
}) {
  return error ? (
    <div className="load-error" role="alert">
      <p>
        The {label} could not be loaded. {error}.
      </p>
      <button onClick={retry}>Try again</button>
    </div>
  ) : (
    <p className="loading-state" role="status">
      Loading {label}…
    </p>
  );
}
