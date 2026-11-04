import { motion, useReducedMotion } from 'motion/react';
import type { ChartRow } from '@/data/site-types';
import { number, title } from '@/lib/format';
export function Bars({
  rows,
  compact = false,
  unit = 'reports',
  max,
}: {
  rows: ChartRow[];
  compact?: boolean;
  unit?: string;
  max?: number;
}) {
  const reduced = useReducedMotion();
  const ceiling = max ?? Math.max(...rows.map((row) => row.value), 1);
  return (
    <div
      className={`bars ${compact ? 'bars-compact' : ''}`}
      role="img"
      aria-label={rows
        .map((row) => `${title(row.label)}: ${number(row.value)} ${unit}`)
        .join('; ')}
    >
      {rows.map((row, index) => (
        <div className="bar-row" key={row.label} aria-hidden="true">
          <span className="bar-label">{title(row.label)}</span>
          <div className="bar-track">
            <motion.span
              className={index ? 'bar-fill secondary' : 'bar-fill'}
              initial={false}
              animate={{ width: `${(row.value / ceiling) * 100}%` }}
              transition={{
                duration: reduced ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            {compact && <span className="bar-value">{number(row.value)}</span>}
          </div>
          {!compact && <span className="bar-value">{number(row.value)}</span>}
        </div>
      ))}
      {!rows.length && <p>No records match these filters.</p>}
    </div>
  );
}
