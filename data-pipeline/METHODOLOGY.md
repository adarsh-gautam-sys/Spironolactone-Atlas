# Methodology log

Phase 1 performed bounded API checks on 3 November 2026. No complete cohort has been extracted or analysed. Use one entry per query/export.
Store raw responses in `data-pipeline/raw/`, intermediate data in `data-pipeline/clean/`, and final exports in `public/data/`.

## Phase 1 API checks

Exact endpoints, parameters, UTC request times, HTTP status, returned-row counts, available-record totals and raw hashes are recorded in the JSON logs below. These are connectivity diagnostics, not results for the website. Samples are small and are not random or representative.

- [Initial run](clean/source-checks/20261103T134919197787Z.json): first check at 2026-11-03 13:49 UTC.
- [Label-query retry](clean/source-checks/20261103T134955331414Z.json): 2026-11-03 13:49 UTC.

| Check                        | HTTP / outcome | Rows returned | API available total | Filters / interpretation                                                          |
| ---------------------------- | -------------- | ------------- | ------------------- | --------------------------------------------------------------------------------- |
| faers-records                | 200, passed    | 5             | 135033              | Harmonized generic name; first-receipt dates 2004–2025; all roles                 |
| faers-suspect-candidate      | 200, passed    | 5             | 134262              | Same date/name filter plus report-search role 1; not yet same-drug validated      |
| faers-reaction-count         | 200, passed    | 5 terms       | Not supplied        | Top five terms for the all-role discovery query; not an exhaustive distribution   |
| fda-label-aldactone, initial | 404, failed    | Not available | Not available       | Exact uppercase brand query returned no match; not interpreted as zero labels     |
| fda-label-aldactone, retry   | 200, passed    | 1             | 1                   | `openfda.brand_name:aldactone`; corrected query retained in queries.json          |
| pubmed-search                | 200, passed    | 3 IDs         | 10603               | Base spironolactone query, publication dates through 2025; not yet topic screened |
| clinicaltrials-search        | 200, passed    | 3 studies     | 331                 | Intervention search only; no date/status restriction; pagination remains          |

The API reported event data updated 2026-10-28 and label data updated 2026-10-30. These are API metadata dates, not guaranteed coverage endpoints. Raw JSON is ignored by Git; audit metadata is tracked. No mapping, deduplication beyond response checks, proportions or medical inference was performed on the samples.

## Reproduce the bounded checks

From the project root in PowerShell:

```powershell
& ./data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/check_sources.py
& ./data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/scripts -p 'test_*.py'
```

Use `--only <check-id>` for one endpoint. Each run creates new timestamped raw files and a shareable log. An optional key is loaded from `data-pipeline/.env`; the logged parameters exclude it. The script exits nonzero if any check fails and does not turn failures into zero counts.

## Research review

The [research foundation](../docs/RESEARCH_FOUNDATION.md) lists reviewed labels, abstract-level evidence, retrieval date and source gaps. The [draft protocol](../docs/DATA_PROTOCOL.md) records the planned dates, counting units, filters and mapping rules. This review did not contact authors or manufacturers, download a licensed MedDRA dictionary, or produce public datasets.

## Empty entry template

| Field                               | Value |
| ----------------------------------- | ----- |
| Source / endpoint                   |       |
| Exact query (omit API keys)         |       |
| Retrieval date and time (UTC)       |       |
| Filters                             |       |
| Record count                        |       |
| Pagination / count limits           |       |
| Raw file                            |       |
| Cleaning / mappings / deduplication |       |
| Export file                         |       |
| Limitations                         |       |

## Phase 2 extraction and publication — 3 November 2026

The [phase-2 audit manifest](clean/phase-2-audit.json) is the per-request log: exact parameters, UTC retrieval timestamps, raw hashes, API update dates, row counts, partitions, repairs and exclusions. The [results report](../docs/PHASE_2_RESULTS.md) summarizes reconciliation. See [PIPELINE.md](PIPELINE.md) for commands and counting rules.

All 22 annual event partitions reconciled to independent first-receipt-date count queries. Daily mismatches were repaired by replacing disputed dates with narrow queries, with original responses retained. Pagination hit totals were observed to vary and were not used as the final denominator. An offline replay reproduced the final cohort before publication.

Publication includes aggregate event data, topic/year publication counts, registered studies, product-label reference indexes, and explicitly sourced manual indication/interaction summaries. Full label text remains in local raw caches. Medical evidence grading and India/SOC gaps remain pending; unknown reported-use classifications are preserved.
