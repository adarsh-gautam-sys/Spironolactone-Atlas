import { ArrowRight } from 'lucide-react';
import { lazy, Suspense } from 'react';
import type { Overview } from '@/data/site-types';
import { useJson } from '@/hooks/useJson';
import CountUp from '@/components/ui/CountUp';
import BlurText from '@/components/ui/BlurText';
import { Bars } from '@/components/charts/Bars';
import { number, percent } from '@/lib/format';
import { Navigation } from '@/components/ui/Navigation';
import { DataTable } from '@/components/charts/ChartBlock';
import { SectionBoundary } from '@/components/ui/SectionBoundary';
import { ReadingGuide } from '@/sections/ReadingGuide';

const AtlasSections = lazy(() => import('@/sections/AtlasSections'));
function DeferredSections({ data }: { data: Overview }) {
  return (
    <SectionBoundary>
      <Suspense
        fallback={
          <p className="loading-state" role="status">
            Loading the evidence atlas…
          </p>
        }
      >
        <AtlasSections data={data} />
      </Suspense>
    </SectionBoundary>
  );
}

export default function App() {
  const { data, error, retry } = useJson<Overview>('atlas-overview');
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <main id="main" className="page-width" tabIndex={-1}>
        <section id="top" className="hero" aria-labelledby="hero-title">
          <BlurText text="AN EDUCATIONAL EVIDENCE ATLAS" />
          <h1 id="hero-title">Spironolactone Atlas</h1>
          <p className="hero-description">
            A guided look at spironolactone uses, research evidence and
            adverse-event reporting.
            <br className="desktop-break" /> Understand the story. Explore the
            sources. See the limits.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#story">
              Read the story <ArrowRight />
            </a>
            <a className="button" href="#reporting">
              Explore data
            </a>
          </div>
          <p className="mobile-disclaimer">
            Educational use. Reporting is not incidence or causality.
          </p>
          {error ? (
            <div className="load-error" role="alert">
              <p>The reporting snapshot could not be loaded. {error}.</p>
              <button onClick={retry}>Try again</button>
            </div>
          ) : (
            <>
              <dl className="hero-stats" aria-busy={!data}>
                <div>
                  <dt>Selected reports</dt>
                  <dd>
                    {data ? (
                      <CountUp to={data.cohort} />
                    ) : (
                      <span aria-label="Loading">—</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Reporting window</dt>
                  <dd>
                    {data ? `${data.window.start}–${data.window.end}` : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Hyperkalaemia mentions</dt>
                  <dd>
                    {data ? number(data.topReactions[0]?.value ?? 0) : '—'}
                  </dd>
                </div>
                <div>
                  <dt>No informative indication</dt>
                  <dd>
                    {data ? percent(data.missingIndication, data.cohort) : '—'}
                  </dd>
                </div>
              </dl>
              {data && (
                <p className="hero-source">
                  Source: <a href={data.source.url}>openFDA</a> · Retrieved 3
                  Nov 2026 · Selected cohort: {number(data.cohort)} reports
                </p>
              )}
            </>
          )}
        </section>
        {data && (
          <section className="opening-chart" aria-labelledby="opening-title">
            <div>
              <h2 id="opening-title">
                What appears in
                <br /> the reports?
              </h2>
              <p>
                Reaction terms are counted within the selected reporting cohort.
              </p>
            </div>
            <div>
              <Bars rows={data.topReactions.slice(0, 3)} compact />
              <p className="opening-denominator">
                openFDA · Retrieved 3 Nov 2026 · Denominator:{' '}
                {number(data.cohort)} selected reports
              </p>
            </div>
          </section>
        )}
        <p className="first-disclaimer">
          Educational use. Reporting is not incidence or causality.
        </p>
        {data && (
          <>
            <DataTable
              rows={data.topReactions.slice(0, 3)}
              download="adverse-reactions"
            />
            <ReadingGuide data={data} />
            <DeferredSections data={data} />
          </>
        )}
      </main>
    </>
  );
}
