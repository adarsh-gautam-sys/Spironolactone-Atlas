/** ISO 8601 date or timestamp, validated by the future export pipeline. */
export type ISODate = string;

export interface Source {
  id: string;
  name: string;
  url: string;
  retrievedAt: ISODate;
  documentVersion?: string;
  reviewedSection?: string;
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
  recordUnit:
    | 'report'
    | 'report-indication'
    | 'publication'
    | 'study'
    | 'label-entry'
    | 'interaction';
  cohortDefinition: string;
  coverage: {
    start: ISODate | null;
    end: ISODate | null;
    dateBasis: string;
    extractionComplete: boolean;
  };
  /** Active dimensions; null within one of these dimensions means unknown. */
  dimensions: string[];
  /** Whether one record can contribute to more than one row/category. */
  categoriesOverlap: boolean;
  denominator?: { count: number; definition: string };
  data: T[];
}

export type Jurisdiction = 'US' | 'UK' | 'India';
export type LabelStatus =
  'labelled' | 'off-label' | 'unspecified' | 'undetermined';
export type EvidenceLevel = 'A' | 'B' | 'C';
export type Sex = 'female' | 'male' | 'unknown';
export type Seriousness = 'serious' | 'non-serious' | 'unknown';

export interface Indication {
  id: string;
  condition: string;
  indicationText: string;
  jurisdiction: Jurisdiction;
  referenceProduct: string;
  formulation: string;
  labelSourceId: string | null;
  labelStatus: LabelStatus;
  classificationRationale: string;
  population: 'adult' | 'paediatric' | 'both' | 'unspecified';
  bodySystem: string | null;
  evidenceLevel: EvidenceLevel | null;
  evidenceReviewStatus: 'pending' | 'reviewed';
  evidenceDirection:
    'benefit' | 'no-clear-benefit' | 'mixed' | 'harm' | 'not-assessed';
  keyTrialOrGuideline: string | null;
  sourceIds: string[];
}

export interface AdverseReaction {
  preferredTerm: string;
  systemOrganClass: string | null;
  reportCount: number;
  seriousness: Seriousness;
  /** Reaction-level outcome, not a report-level seriousness criterion. */
  reactionOutcome: string | null;
  sex: Sex;
  ageBand: string | null;
  reportYear: number | null;
  country: string | null;
  /** Null when this aggregate does not include co-suspect detail. */
  coSuspectDrugs: string[] | null;
  sourceIds: string[];
}

export interface ReportedUsage {
  reportedIndication: string;
  condition: string | null;
  labelStatus: LabelStatus;
  /** Label classification depends on jurisdiction. */
  jurisdiction: Jurisdiction;
  referenceProduct: string;
  labelSourceId: string | null;
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
  sex: Sex;
  ageBand: string | null;
  country: string | null;
  reportCount: number;
  sourceIds: string[];
}

export interface SeriousnessCriterionCount {
  criterion: string;
  reportCount: number;
  sourceIds: string[];
}

export interface ReactionOutcomeCount {
  outcome: string | null;
  reportCount: number;
  sourceIds: string[];
}

export interface CoreportedDrugCount {
  reportedDrug: string;
  reportCount: number;
  sourceIds: string[];
}

export interface TrialRecord {
  nctId: string;
  startYear: number | null;
  status: string | null;
  phases: string[];
  conditions: string[];
  countries: string[];
  sourceIds: string[];
}

export interface LabelSection {
  id: string;
  product: string;
  jurisdiction: Jurisdiction;
  setId: string;
  effectiveDate: string | null;
  section: string;
  text: string;
  sourceIds: string[];
}

export interface ExportContracts {
  indications: Dataset<Indication>;
  interactions: Dataset<Interaction>;
  'adverse-reactions': Dataset<AdverseReaction>;
  'adverse-reactions-filtered': Dataset<AdverseReaction>;
  'report-summary': Dataset<ReportSummary>;
  usage: Dataset<ReportedUsage>;
  'seriousness-criteria': Dataset<SeriousnessCriterionCount>;
  'reaction-outcomes': Dataset<ReactionOutcomeCount>;
  'hyperkalaemia-coreported': Dataset<CoreportedDrugCount>;
  'research-publications': Dataset<ResearchCount>;
  trials: Dataset<TrialRecord>;
  'label-sections': Dataset<LabelSection>;
}
