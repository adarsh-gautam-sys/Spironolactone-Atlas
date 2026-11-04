import type { Overview, EvidenceData } from '@/data/site-types';
import type { Dataset, Indication, Interaction } from '@/data/types';
import { useJson } from '@/hooks/useJson';
import { useEffect } from 'react';
import { Mechanism } from '@/sections/Mechanism';
import { Evidence } from '@/sections/Evidence';
import { Reporting } from '@/sections/Reporting';
import { Research } from '@/sections/Research';
import { Interactions } from '@/sections/Interactions';
import { Methods } from '@/sections/Methods';
export default function AtlasSections({ data }: { data: Overview }) {
  const labels = useJson<Dataset<Indication>>('indications');
  const evidence = useJson<EvidenceData>('evidence-appraisal');
  const interactions = useJson<Dataset<Interaction>>('interactions');
  useEffect(() => {
    if (
      (!labels.data && !labels.error) ||
      (!evidence.data && !evidence.error) ||
      (!interactions.data && !interactions.error)
    )
      return;
    let cancelled = false;
    const hash = location.hash;
    void document.fonts.ready.then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled && hash && location.hash === hash)
            document
              .getElementById(hash.slice(1))
              ?.scrollIntoView({ behavior: 'instant' });
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [
    labels.data,
    labels.error,
    evidence.data,
    evidence.error,
    interactions.data,
    interactions.error,
  ]);
  return (
    <>
      <section
        id="medicine"
        className="atlas-section context-section"
        aria-label="Medicine context"
      >
        <Mechanism />
      </section>
      <Evidence labels={labels} evidence={evidence} />
      <Reporting data={data} />
      <Research data={data} />
      <Interactions data={data} dataset={interactions} />
      <Methods data={data} labels={labels} evidence={evidence} />
    </>
  );
}
