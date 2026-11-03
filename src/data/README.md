# Data contracts

`types.ts` contains provisional JSON contracts derived from PRD sections 5.2–5.3 and 6, refined by the Phase 1 source review. The PRD does not provide formal JSON schemas or filenames. Confirm these contracts during data extraction; they are TypeScript types, not runtime validators. See [the counting protocol](../../docs/DATA_PROTOCOL.md).

All exports use `Dataset<T>` with named sources, retrieval dates, exact queries, filters, record counts and limitations. Counts mean reports or records, never incidence. Use `null` for unknown values, not zero. Reference IDs must resolve to the dataset's sources. No sample medical facts or fabricated data are included.

The envelope declares record unit, cohort, date coverage, active dimensions, overlap and extraction completeness. `null` means unknown within an active dimension; an inactive dimension is not a filter. A denominator, when provided, needs its own definition. Reaction outcomes and report-level seriousness are separate. Report-level seriousness-criteria exports will need a dedicated overlapping-flag contract before implementation.

Label classification requires a jurisdiction and reference product. `unspecified` means no usable indication was reported; `undetermined` means the label comparison lacks enough evidence or context. A/B/C grades remain null until appraisal; evidence direction is separate from evidence quality. The setup-only `Regulator` type was replaced with `Jurisdiction` because countries are not regulators; no consuming UI existed.

Suggested exports: `indications.json`, `adverse-reactions.json`, `usage.json`, `research.json`, `interactions.json`, `report-summary.json`. Each file contains the corresponding row type in its `data` array. Dates use ISO 8601 strings; proportions, if added later, require an explicit denominator and calculation method.
