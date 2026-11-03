# Project phases

The seven-day PRD schedule is a sequence of deliverables, not a fixed deadline. Work advances one phase at a time on user instruction.

| Phase                   | Scope                                                                                 | Status                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 0 — Setup               | Toolchain, folders, conventions, placeholder                                          | Complete; commit fd186dd                                                     |
| 1 — Research foundation | Source review, bounded API tests, indication/evidence shortlist, draft data contracts | Complete with documented source gaps, 3 November 2026                        |
| 2 — Data pipeline       | Full extraction, cleaning, mappings, validation, typed JSON/CSV exports               | Complete with documented appraisal gaps, 3 November 2026                     |
| 3 — Analysis            | Descriptive results, uncertainty and limitations, evidence grading, insight shortlist | Complete bounded appraisal; clinical/source gaps documented, 3 November 2026 |
| 4 — Design              | Tokens, typography, layout and motion plan for review                                 | In progress: Impeccable shape; audience and comp-first confirmed             |
| 5 — Frontend            | Sections, charts, tables and selected effects                                         | Not started                                                                  |
| 6 — Quality and launch  | Accessibility, performance, deployment and LinkedIn assets                            | Not started                                                                  |

Phase 1 is a research inventory and executable connectivity check, not a systematic review or a completed dataset. It does not establish incidence, causal relationships, clinical recommendations or an off-label prescribing prevalence.

## Phase 1 deliverables

- [Source review and evidence shortlist](RESEARCH_FOUNDATION.md)
- [Extraction and counting protocol](DATA_PROTOCOL.md)
- [Draft data contracts](../src/data/README.md)
- [Exact API check parameters](../data-pipeline/queries.json)
- [Methodology and run logs](../data-pipeline/METHODOLOGY.md)

## Phase 2 entry conditions

Proceed with US/UK sources and an explicit unresolved India status. Do not claim an Indian approval comparison until a dated, India-specific product document is obtained. Obtain a permitted MedDRA hierarchy or replace the proposed SOC view with an honestly named, sourced body-system grouping. Implement same-drug suspect filtering and completeness checks before producing any report counts for the site.

No UI or design changes were made in Phase 1. Phase 2 subsequently populated `public/data/` with validated exports.

## Phase 2 deliverables

See [pipeline results](PHASE_2_RESULTS.md), [reproduction guide](../data-pipeline/PIPELINE.md), and [export manifest](../public/data/manifest.json). Phase 3 will appraise the data and evidence before design begins.

## Phase 3 deliverables

See [analysis and diagnostic figures](PHASE_3_ANALYSIS.md), [targeted evidence appraisal](EVIDENCE_APPRAISAL.md), [five draft takeaways](INSIGHT_SHORTLIST.md), and [content decisions](CONTENT_DECISIONS.md). The reaction-case correction was pushed separately as commit 05f688a. Next is Phase 4 design review; the website remains the setup placeholder.
