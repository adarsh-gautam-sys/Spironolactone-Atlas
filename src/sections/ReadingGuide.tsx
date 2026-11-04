import { ArrowRight } from 'lucide-react';
import type { Overview } from '@/data/site-types';
import { date, number, percent } from '@/lib/format';

export function ReadingGuide({ data }: { data: Overview }) {
  const points = [
    {
      heading: 'The reporting denominator matters.',
      text: `${number(data.cohort)} retained reports follow same-entry suspect and single-ingredient filtering. They are not a population of medicine users.`,
      target: 'reporting',
    },
    {
      heading: 'Missingness is a finding.',
      text: `${percent(data.missingIndication, data.cohort)} have no informative indication. A reliable off-label prescribing percentage cannot be established.`,
      target: 'reporting',
    },
    {
      heading: 'Research activity and evidence differ.',
      text: 'Publication and registry counts help discover research. Read the actual endpoint, population and appraisal before drawing a conclusion.',
      target: 'research',
    },
  ];
  return (
    <section
      id="story"
      className="atlas-section reading-guide"
      data-chapter="story"
      aria-labelledby="story-title"
    >
      <h2 id="story-title">The story in three points.</h2>
      <ol>
        {points.map((point) => (
          <li key={point.heading}>
            <h3>{point.heading}</h3>
            <p>{point.text}</p>
            <a
              href={`#${point.target}`}
              aria-label={`See evidence: ${point.heading}`}
            >
              <ArrowRight />
            </a>
          </li>
        ))}
      </ol>
      <p className="source-note">
        Source: <a href={data.source.url}>openFDA</a> · Retrieved{' '}
        {date(data.source.retrievedAt)}. Research sources and queries are linked
        in <a href="#research">research activity</a>.
      </p>
      <a className="text-link" href="#medicine">
        Continue with the medicine <ArrowRight size={18} />
      </a>
    </section>
  );
}
