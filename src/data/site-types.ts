import type { Source } from '@/data/types';
export interface ChartRow {
  label: string;
  value: number;
}
export interface Overview {
  schemaVersion: string;
  generatedAt: string;
  source: Source;
  cohort: number;
  missingIndication: number;
  window: { start: number; end: number };
  topReactions: ChartRow[];
  marginals: Record<
    'sex' | 'ageBand' | 'seriousness' | 'reportYear' | 'country',
    ChartRow[]
  >;
  criteria: ChartRow[];
  outcomes: ChartRow[];
  indicationTerms: ChartRow[];
  coreported: ChartRow[];
  reactionGroupRates: {
    term: string;
    dimension: string;
    group: string | null;
    reportCount: number;
    denominator: number;
    percentWithinReportedGroup: number;
  }[];
  research: { topic: string; countsByYear: Record<string, number> }[];
  trialStatuses: ChartRow[];
  trialPhases: ChartRow[];
  trialCount: number;
  researchSources: Source[];
  queries: {
    query: string;
    sourceId: string;
    retrievedAt: string;
    recordCount: number;
  }[];
}
export interface Appraisal {
  topic: string;
  grade: 'A' | 'B' | 'C';
  direction: string;
  question: string;
  sourceIds: string[];
  design: string;
  biasAndPrecision: string;
  applicability: string;
  interpretation: string;
}
export interface EvidenceData {
  schemaVersion: string;
  reviewedAt: string;
  reviewType: string;
  gradeDefinitions: Record<'A' | 'B' | 'C', string>;
  limitations: string[];
  sources: { id: string; url: string; scope: string }[];
  data: Appraisal[];
}
