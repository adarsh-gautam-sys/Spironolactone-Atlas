# Phase 2 pipeline

The pipeline extracts the 2004–2025 first-receipt event window, the same publication-year window for the ten research topics, current registered-study records with starts in that window (plus unknown dates), and current US product label sections. It performs descriptive counting only; interpretation and evidence grading belong to Phase 3.

## Commands

From the project root, use the existing virtual environment:

```powershell
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/pipeline.py --run 2026-11-03-faers --source faers
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/pipeline.py --run 2026-11-03 --source trials
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/pipeline.py --run 2026-11-03 --source pubmed
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/pipeline.py --run 2026-11-03-labels --source labels
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/curate_reference.py
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/publish_data.py --runs 2026-11-03-faers 2026-11-03 2026-11-03-labels
& ./data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/scripts -p 'test_*.py'
```

For a new retrieval date, choose new `--run` names. Reusing a name resumes its cached snapshot and never refreshes already cached requests. Add `--offline` to require a cache-only replay with all network requests disabled. Do not run multiple processes against the same snapshot directory at the same time. Different snapshot directories may run independently. For a new manual reference review, update and review the versioned curator and its source dates before publication; its current output snapshot is `2026-11-03-reference`.

An optional openFDA key is loaded from the ignored `data-pipeline/.env`. Only openFDA requests receive it. Parameters written to logs and pagination metadata exclude the key. Publication additionally scans metadata and datasets for the configured key. The live server required a key for 1,000-record requests; 500-record requests worked without one. Extraction uses 500-record pages and four independent year partitions.

## Storage and reproducibility

- `raw/phase-2/<run>/`: compressed API responses and manifest. Ignored by Git. Each response is hashed, timestamped and tied to exact parameters. A cached hash mismatch stops the run.
- `clean/exports/<run>/`: validated staging JSON/CSV. Ignored by Git. Full extraction completes before each source writes its staged exports.
- `clean/phase-2-audit.json`: tracked request metadata, coverage and exclusion audit, raw hashes and export index. Raw responses are required to independently replay extraction; the repository alone contains provenance and final aggregate exports, not all raw medical reports.
- `public/data/`: validated JSON/CSV pairs and a manifest with row counts, byte sizes and SHA-256 hashes. The website remains the setup placeholder.

Complete first-receipt-date bucket counts (at most 366 per year) are summed and checked against downloaded raw records. Paginated response hit totals can vary and are not used as the reconciliation denominator. FAERS duplicate IDs are consolidated by highest report version, then latest `receiptdate`. If two payloads at the same rank disagree on fields used by this pipeline, that ID is excluded. Raw page counts, unique IDs, duplicate records and ambiguous exclusions are separately logged. Different IDs for the same real-world case remain a known limitation. A daily histogram mismatch triggers narrow-date re-queries that replace disputed dates, with every discarded/replacement record count logged. All disputed original dates are removed before merging replacement records. If a direct date query cannot match its independent count, the export stops. Original compressed responses remain intact for audit. API update dates are retained per partition; review these before comparing snapshots.

Raw responses remain in cache. Usage rows count normalized source-term pairs; synonym rows must not be summed to estimate distinct report�condition counts because synonyms can co-occur. The in-memory cleaning representation retains the fields required for counting, including original drug/indication/reaction text. Public drug and indication terms are normalized to lowercase words for exact mapping. `indication-map.json` is an explicit, limited terminology dictionary; unmapped conditions stay null. Missing indication is `unspecified`; other reported indications remain `undetermined` for label status because product/population qualifiers have not been appraised. No off-label prescribing percentage can be calculated from this release.

## Export contracts

`scripts/schemas.py` validates each row's exact field set, types, string arrays and enums. `pipeline.validate` additionally checks source references, dates, nonnegative integer counts, completeness and count bounds. TypeScript mirrors live in `src/data/types.ts` (`ExportContracts`). Unknown values remain null/unknown rather than zero. Validation finishes for all staged datasets before publication begins.

| File                       | Unit and detail                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| adverse-reactions          | All distinct reaction terms; count each retained report at most once per term                                    |
| adverse-reactions-filtered | Global top 50 terms, stratified by seriousness, reported sex and age band                                        |
| report-summary             | Disjoint report strata by first-receipt year, seriousness, reported sex, age and event country                   |
| usage                      | Distinct report–normalized-indication pairs, matched suspect drug entries only                                   |
| seriousness-criteria       | Overlapping report-level seriousness flags                                                                       |
| reaction-outcomes          | Reports containing each reaction outcome code, including unknown; overlapping categories                         |
| hyperkalaemia-coreported   | Raw normalized drug names co-reported in retained hyperkalaemia/hyperkalemia reports; not validated interactions |
| research-publications      | Unique PMIDs per topic/year query; dates and topics may overlap                                                  |
| trials                     | One row per retained NCT ID; original conditions/phases, current status, start year                              |
| label-sections             | Current Aldactone and Carospir US section indexes with set ID/effective date; full text in the ignored raw cache |
| indications                | Thirteen manually extracted product-specific indication entries from reviewed US/UK documents                    |
| interactions               | Seven paraphrased Carospir label interaction groups; severity and inferred mechanisms left null                  |

For inactive ADR dimensions, null/unknown values are placeholders; consult `dimensions` before treating them as an unknown-value group. `coSuspectDrugs` is null because these aggregates do not include that detail. SOC is null pending permitted MedDRA mapping. Country in report summaries is event country, never substituted reporter country. Age units use explicit conversion factors (365.25-day year), with values outside 0–120 years retained in the unknown band.

Single-ingredient classification is deliberately conservative. Known hydrochlorothiazide/furosemide combinations are excluded. Unresolved ingredient mixtures are excluded and counted. The alias discovery query is documented in DATA_PROTOCOL.md; it is not proof of complete recall for every spelling or brand. Trial intervention matches are textual and conservative; condition-topic screening remains an explicit review task. PubMed topic strings are discovery queries rather than a validated systematic-review search.

## Outstanding curation

The India-specific product label, permitted MedDRA hierarchy, full-text evidence grades, refined indication classification and topic screening remain explicit gaps. Current exports preserve those unknowns. The Phase 3 analysis must account for missingness and exclusions before presenting any takeaway.
