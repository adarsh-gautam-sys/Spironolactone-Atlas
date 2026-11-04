import type { Source } from '@/data/types';
import { date, number } from '@/lib/format';
export function SourceNote({
  sources,
  denominator,
  note,
}: {
  sources: Source[];
  denominator?: number;
  note?: string;
}) {
  return (
    <p className="source-note">
      Source:{' '}
      {sources.map((source, index) => (
        <span key={source.id}>
          {index > 0 ? ' · ' : ''}
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.name}
          </a>{' '}
          · Retrieved {date(source.retrievedAt)}
        </span>
      ))}
      {denominator !== undefined
        ? ` · Denominator: ${number(denominator)} selected reports`
        : ''}
      {note ? ` · ${note}` : ''}
    </p>
  );
}
