/** ISO 8601 date or timestamp, validated by the future export pipeline. */
export type ISODate = string;

export interface Source {
  id: string;
  name: string;
  url: string;
  retrievedAt: ISODate;
  citation?: string;
  page?: string;
}

export interface QueryLog {
  sourceId: string;
  query: string;
  retrievedAt: ISODate;
  filters: Record<string, string | number | boolean | null>;
  recordCount: number;
}

export interface Dataset<T> {
  schemaVersion: '1.0';
  generatedAt: ISODate;
  sources: Source[];
  queries: QueryLog[];
  limitations: string[];
  data: T[];
}

export type Regulator = 'FDA' | 'UK' | 'India';
export type LabelStatus = 'labelled' | 'off-label' | 'unspecified';
export type EvidenceLevel = 'A' | 'B' | 'C';
export type Sex = 'female' | 'male' | 'unknown';
export type Seriousness = 'serious' | 'non-serious' | 'unknown';

export interface Indication {
  id: string;
  condition: string;
  indicationText: string;
  regulator: Regulator;
  labelStatus: LabelStatus;
  population: 'adult' | 'paediatric' | 'both' | 'unspecified';
  bodySystem: string | null;
  evidenceLevel: EvidenceLevel | null;
  keyTrialOrGuideline: string | null;
  sourceIds: string[];
}

export interface AdverseReaction {
  preferredTerm: string;
  systemOrganClass: string | null;
  reportCount: number;
  seriousness: Seriousness;
  outcome: string | null;
  sex: Sex;
  ageBand: string | null;
  reportYear: number | null;
  country: string | null;
  coSuspectDrugs: string[];
  sourceIds: string[];
}

export interface ReportedUsage {
  reportedIndication: string;
  condition: string | null;
  labelStatus: LabelStatus;
  /** Label classification depends on jurisdiction. */
  regulator: Regulator;
  reportCount: number;
  sourceIds: string[];
}

export interface ResearchCount {
  condition: string;
  year: number;
  publicationCount: number | null;
  trialCount: number | null;
  phase: string | null;
  status: string | null;
  country: string | null;
  sourceIds: string[];
}

export interface Interaction {
  id: string;
  drugOrClass: string;
  effect: string;
  severity: string | null;
  mechanism: string | null;
  managementNote: string | null;
  sourceIds: string[];
}

export interface ReportSummary {
  reportYear: number | null;
  seriousness: Seriousness;
  outcome: string | null;
  sex: Sex;
  ageBand: string | null;
  country: string | null;
  reportCount: number;
  sourceIds: string[];
}
