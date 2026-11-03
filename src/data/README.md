# Data contracts

`types.ts` contains provisional JSON contracts derived from PRD sections 5.2–5.3 and 6. The PRD does not provide formal JSON schemas or filenames. Confirm these contracts during data extraction; they are TypeScript types, not runtime validators.

All exports use `Dataset<T>` with named sources, retrieval dates, exact queries, filters, record counts and limitations. Counts mean reports or records, never incidence. Use `null` for unknown values, not zero. Reference IDs must resolve to the dataset's sources. No sample medical facts or fabricated data are included.

Suggested exports: `indications.json`, `adverse-reactions.json`, `usage.json`, `research.json`, `interactions.json`, `report-summary.json`. Each file contains the corresponding row type in its `data` array. Dates use ISO 8601 strings; proportions, if added later, require an explicit denominator and calculation method.
