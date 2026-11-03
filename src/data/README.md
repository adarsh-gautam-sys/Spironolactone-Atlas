# Data contracts

`types.ts` contains JSON contracts derived from PRD sections 5.2–5.3 and 6, refined during source review and pipeline implementation. `ExportContracts` maps generated filenames to row types. Runtime row contracts are enforced by `data-pipeline/scripts/schemas.py`, together with provenance/count checks in the pipeline and publication gates. See [the counting protocol](../../docs/DATA_PROTOCOL.md) and [pipeline guide](../../data-pipeline/PIPELINE.md).

All exports use `Dataset<T>` with named sources, retrieval dates, exact queries, filters, record counts and limitations. Counts mean reports or records, never incidence. Use `null` for unknown values, not zero. Reference IDs must resolve to the dataset's sources. No sample medical facts or fabricated data are included.

The envelope declares record unit, cohort, date coverage, active dimensions, overlap and extraction completeness. `null` means unknown within an active dimension; an inactive dimension is not a filter. A denominator, when provided, needs its own definition. Reaction outcomes and report-level seriousness are separate. Report-level seriousness-criteria exports will need a dedicated overlapping-flag contract before implementation.

Label classification requires a jurisdiction and reference product. `unspecified` means no usable indication was reported; `undetermined` means the label comparison lacks enough evidence or context. A/B/C grades remain null until appraisal; evidence direction is separate from evidence quality. The setup-only `Regulator` type was replaced with `Jurisdiction` because countries are not regulators; no consuming UI existed.

The generated filenames and counting units are listed in the pipeline guide and mapped in `ExportContracts`. Each JSON file contains the corresponding row type in its `data` array; CSV companions contain the same rows. Dates use ISO 8601 strings; proportions, if added later, require an explicit denominator and calculation method.
