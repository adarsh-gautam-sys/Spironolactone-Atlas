import type { AdverseReaction, ReportSummary } from '../data/types';
import type { ChartRow } from '../data/site-types';
export interface ReportFilters {
  sex: string;
  seriousness: string;
  ageBand: string;
}
export function matchesReport(
  row: Pick<ReportSummary, 'sex' | 'seriousness' | 'ageBand'>,
  filters: ReportFilters,
) {
  return (
    (filters.sex === 'all' || row.sex === filters.sex) &&
    (filters.seriousness === 'all' ||
      row.seriousness === filters.seriousness) &&
    (filters.ageBand === 'all' ||
      (row.ageBand ?? 'unknown') === filters.ageBand)
  );
}
export function filterReports(
  reactions: AdverseReaction[],
  summary: ReportSummary[],
  filters: ReportFilters,
): { rows: ChartRow[]; denominator: number } {
  const counts = new Map<string, number>();
  for (const row of reactions)
    if (matchesReport(row, filters))
      counts.set(
        row.preferredTerm,
        (counts.get(row.preferredTerm) ?? 0) + row.reportCount,
      );
  return {
    rows: [...counts]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    denominator: summary
      .filter((row) => matchesReport(row, filters))
      .reduce((sum, row) => sum + row.reportCount, 0),
  };
}
