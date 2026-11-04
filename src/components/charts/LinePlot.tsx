import { line } from 'd3';
import { useEffect, useRef, useState } from 'react';
import type { ChartRow } from '@/data/site-types';
import { number } from '@/lib/format';

export function LinePlot({
  rows,
  unit = 'reports',
}: {
  rows: ChartRow[];
  unit?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const size = entries[0]?.contentRect.width;
      if (size) setWidth(Math.max(240, Math.round(size)));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const height = 230,
    left = 56,
    bottom = 34,
    top = 15;
  const maximum = Math.max(1, ...rows.map((row) => row.value));
  const x = (index: number) =>
    left + (index / Math.max(rows.length - 1, 1)) * (width - left - 20);
  const y = (value: number) =>
    height - bottom - (value / maximum) * (height - bottom - top);
  const path =
    line<ChartRow>()
      .x((_, index) => x(index))
      .y((row) => y(row.value))(rows) ?? '';
  return (
    <svg
      ref={ref}
      className="line-plot"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${unit} by year. ${rows.map((row) => `${row.label}: ${number(row.value)}`).join('; ')}`}
    >
      {[0, 0.5, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1={left}
            x2={width - 20}
            y1={y(maximum * ratio)}
            y2={y(maximum * ratio)}
            className="plot-grid"
          />
          <text x={left - 10} y={y(maximum * ratio) + 4} textAnchor="end">
            {number(Math.round(maximum * ratio))}
          </text>
        </g>
      ))}
      <path d={path} className="plot-path" />
      {rows
        .filter(
          (_, index) =>
            index === 0 ||
            index === rows.length - 1 ||
            (index % 5 === 0 && index < rows.length - 3),
        )
        .map((row) => (
          <text
            key={row.label}
            x={x(rows.indexOf(row))}
            y={height - 7}
            textAnchor="middle"
          >
            {row.label}
          </text>
        ))}
    </svg>
  );
}
