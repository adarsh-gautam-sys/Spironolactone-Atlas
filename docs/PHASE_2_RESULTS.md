# Phase 2 — pipeline results

Completed 3 November 2026. The website continues to show the setup placeholder. This report records extraction/validation outcomes, not clinical findings.

## Reconciled event cohort

- Window: 2004–2025 first FDA receipt; all 22 annual partitions checked against complete receipt-date buckets.
- Raw candidate records: 142,095.
- Distinct IDs before ambiguous exclusion: 142,076.
- Conflicting equal-rank IDs excluded: 17.
- Candidate IDs entering drug-entry checks: 142,059.
- Retained same-entry suspect, conservatively single-ingredient reports: 24,805.
- Excluded without a matching suspect drug entry: 115,435.
- Excluded unresolved products: 1,469.
- Excluded known combination products: 350.
- Disputed receipt dates replaced through narrow re-queries: 274.

These counts describe this documented query and selection protocol, not exhaustive recall of every brand or spelling. Drug roles are reporter-assigned, and reactions are linked to reports rather than individual medicines.

## Generated files

| Dataset                    | Rows  | JSON bytes |
| -------------------------- | ----- | ---------- |
| adverse-reactions-filtered | 1,163 | 592,340    |
| adverse-reactions          | 4,293 | 1,349,558  |
| hyperkalaemia-coreported   | 3,593 | 597,594    |
| reaction-outcomes          | 7     | 316,684    |
| report-summary             | 3,224 | 747,859    |
| seriousness-criteria       | 6     | 316,762    |
| usage                      | 582   | 441,329    |
| research-publications      | 220   | 134,298    |
| trials                     | 227   | 45,175     |
| label-sections             | 10    | 6,486      |
| indications                | 13    | 9,210      |
| interactions               | 7     | 3,270      |

Every dataset has a JSON envelope with sources, queries, dates, units, overlap and limitations, plus a CSV companion. [Export manifest](../public/data/manifest.json) contains hashes. [Audit manifest](../data-pipeline/clean/phase-2-audit.json) contains exact parameters, raw cache hashes and exclusions.

## Verification

- Full extraction reconciled across all date partitions, followed by a successful network-disabled cache replay.
- Publication checked source references, field sets, types, enums, nonnegative counts, complete source coverage, cohort/exclusion reconciliation, reaction strata, and the absence of the configured API key.
- 22 offline tests cover missing values, same-entry role checks, product exclusions, duplicate versions/conflicts, date repairs and invalid output rows.
- TypeScript, ESLint, Prettier and production build checked; public export hashes and CSV row counts verified.

## Remaining appraisal work

The Indian product label and permitted MedDRA hierarchy remain unresolved. Evidence grades, detailed topic screening and product/population-specific reported-use classification remain for Phase 3. Usage rows are source-term pairs; synonyms can overlap within reports and cannot simply be summed into distinct-condition totals. Clinical conclusions and off-label prescribing prevalence are not established by this release.

No new dependencies were needed. The local API key is stored in the ignored environment file, and raw response caches are excluded from Git.

## Phase 3 data correction

Reaction-term capitalization and whitespace were normalized within each report before aggregation. This merges case variants without double-counting co-occurrence. Historical synonyms remain distinct. The cohort and exclusions are unchanged; export hashes and reaction rankings were regenerated.
