import { useState } from 'react';
import type { Overview } from '@/data/site-types';
import { ChartBlock } from '@/components/charts/ChartBlock';
import { LinePlot } from '@/components/charts/LinePlot';
import { Bars } from '@/components/charts/Bars';
import { number, title, topicName } from '@/lib/format';

export function Research({ data }: { data: Overview }) {
  const [topic, setTopic] = useState(data.research[0]?.topic ?? 'acne');
  const current = data.research.find((item) => item.topic === topic);
  const rows = Object.entries(current?.countsByYear ?? {})
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => Number(a.label) - Number(b.label));
  const pubSource = data.researchSources.filter(
    (source) => source.id === 'PUBMED',
  );
  const trialSource = data.researchSources.filter(
    (source) => source.id === 'CTG',
  );
  return (
    <section id="research" className="atlas-section" data-chapter="research">
      <div className="section-heading">
        <h2>
          More research.
          <br />A different kind of evidence.
        </h2>
        <p>
          A growing search result is a discovery signal. It does not say whether
          an intervention works, how well a study was conducted, or whether its
          findings apply to a particular person.
        </p>
      </div>
      <div className="filters">
        <label>
          Publication topic
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            {data.research.map((item) => (
              <option value={item.topic} key={item.topic}>
                {topicName(item.topic)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ChartBlock
        title={`${topicName(topic)} in PubMed`}
        takeaway="Annual counts come from the saved topic-specific search. Topics overlap; query vocabulary and indexing affect the trend."
        rows={rows}
        sources={pubSource}
        unit="Publications"
        download="research-publications"
      >
        <LinePlot rows={rows} unit="Publications" />
      </ChartBlock>
      <div className="two-column">
        <ChartBlock
          title="Registered study status"
          takeaway={`${number(data.trialCount)} retained registry records. Completed status does not mean a positive result.`}
          rows={data.trialStatuses.map((row) => ({
            ...row,
            label: title(row.label.toLowerCase()),
          }))}
          sources={trialSource}
          unit="Studies"
          download="trials"
        >
          <Bars
            rows={data.trialStatuses
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((row) => ({
                ...row,
                label: title(row.label.toLowerCase()),
              }))}
            unit="studies"
          />
        </ChartBlock>
        <ChartBlock
          title="Registered study phases"
          takeaway="Phase is a registry field, not an evidence grade. A study can list more than one phase."
          rows={data.trialPhases.map((row) => ({
            ...row,
            label: title(row.label.toLowerCase()),
          }))}
          sources={trialSource}
          unit="Studies"
          note="Phase categories may overlap."
          download="trials"
        >
          <Bars
            rows={data.trialPhases.map((row) => ({
              ...row,
              label: title(row.label.toLowerCase()),
            }))}
            unit="studies"
          />
        </ChartBlock>
      </div>
    </section>
  );
}
