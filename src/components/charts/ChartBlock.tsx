import type { ReactNode } from 'react';
import type { ChartRow } from '@/data/site-types';
import type { Source } from '@/data/types';
import { SourceNote } from '@/components/ui/SourceNote';
import { number, sourcePath, title } from '@/lib/format';

export function DataTable({
  rows,
  unit = 'Reports',
  download,
}: {
  rows: ChartRow[];
  unit?: string;
  download?: string;
}) {
  return (
    <details className="data-details">
      <summary>View data</summary>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Chart data"
      >
        <table>
          <caption className="sr-only">Underlying chart values</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{title(row.label)}</th>
                <td>{number(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {download && (
        <a className="text-link" href={sourcePath(download)} download>
          Download source CSV
        </a>
      )}
    </details>
  );
}
export function ChartBlock({
  title: heading,
  takeaway,
  rows,
  sources,
  denominator,
  note,
  children,
  unit,
  download,
}: {
  title: string;
  takeaway: string;
  rows: ChartRow[];
  sources: Source[];
  denominator?: number;
  note?: string;
  children: ReactNode;
  unit?: string;
  download?: string;
}) {
  return (
    <figure className="chart-block" data-visual>
      <figcaption>
        <h3>{heading}</h3>
        <p className="chart-takeaway">{takeaway}</p>
      </figcaption>
      {children}
      <SourceNote sources={sources} denominator={denominator} note={note} />
      <DataTable rows={rows} unit={unit} download={download} />
    </figure>
  );
}
