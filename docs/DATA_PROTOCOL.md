# Phase 1 — draft data and counting protocol

Version: phase-1-v1. Prepared 3 November 2026. This is the extraction specification for Phase 2; no complete cohort has been extracted or analysed.

## Dates and scope

- Default FAERS discovery window: first FDA receipt (`receivedate`) from 2004-01-01 through 2025-12-31, worldwide reports. This is a project choice for complete calendar years, not proof that reporting is complete. Exclude partial 2026 from the primary trend.
- `receiptdate` is the latest information receipt date. Preserve it separately. A historical first-receipt window can still include later follow-up information in the current snapshot. [FDA field dictionary](https://open.fda.gov/fields/drugevent.yaml).
- Literature trend window: publication dates through 2025-12-31. Current labels and evidence review may include later material; keep those purposes separate.
- Trial trend: use study start year through 2025, with missing dates retained as unknown. The connectivity query deliberately has no date/status filter. Full extraction must apply the stated window and record extraction-time status, which is not historical status.
- Store every snapshot time, API update date where supplied, exact parameters and raw-file hash. Do not overwrite a previous extraction or silently mix snapshots.

## openFDA candidate search

The exact tested queries are in `data-pipeline/queries.json`. The generic-name query tests the harmonized field only; it is not an exhaustive alias search. The proposed discovery query to validate in Phase 2 is:

```text
(patient.drug.openfda.generic_name:spironolactone OR patient.drug.medicinalproduct:spironolactone OR patient.drug.openfda.brand_name:aldactone OR patient.drug.medicinalproduct:aldactone OR patient.drug.openfda.brand_name:carospir OR patient.drug.medicinalproduct:carospir) AND receivedate:[20040101 TO 20251231]
```

Do not sum counts from separate aliases; retrieve their union and deduplicate IDs. Matching should preserve original text, normalized ingredient list, brand, formulation, combination status and matching method. Missing harmonized fields do not by themselves exclude a record. Unresolved names go to review, not automatic inclusion.

The tested `generic_name AND drugcharacterization:1` query is only a **candidate report filter**. This review has not established same-array-element semantics for those search terms. Therefore explicitly inspect each `patient.drug` object and require that the _same drug entry_ both matches spironolactone and has role `1` for the primary suspect cohort. Role `2` is concomitant and `3` interacting; the reporter-assigned roles are not FDA-validated. Keep role-3 reports separate unless a documented sensitivity analysis includes them. [Field definitions](https://open.fda.gov/fields/drugevent.yaml).

Even after that check, reactions are associated with the report, not with a particular drug. Use “reports mentioning…” language and never infer causality or incidence. [openFDA event overview](https://open.fda.gov/apis/drug/event/).

## Completeness and deduplication

- openFDA documents that it returns the latest version of a report. Preserve `safetyreportid` and `safetyreportversion`; deduplicate repeat downloads across partitions, and resolve inconsistent repeated IDs explicitly. This does not remove different IDs that represent the same real-world case. [Field dictionary](https://open.fda.gov/fields/drugevent.yaml).
- Partition retrieval by non-overlapping first-receipt date ranges. Start with calendar years and split further if needed. Reconcile raw unique IDs against candidate totals before same-drug and product filters; separately log every exclusion.
- Current documented `limit` maximum is 1,000 and `skip` maximum is 25,000. The count API returns frequent terms, so top-N results cannot define an exhaustive denominator. If a partition exceeds retrieval limits, split it or use the documented bulk/paging mechanism; never silently truncate. [Query parameters](https://open.fda.gov/apis/query-parameters/).
- Cache before processing. Add bounded retries for 429/5xx and resume support in Phase 2. The Phase 1 checker deliberately makes small sequential requests and records failures without retry loops.
- Without an openFDA key, the documented allowance is 240 requests/minute and 1,000/day per IP; with a key, 240/minute and 120,000/day. Respect shared-IP limits and keep keys out of logs. [Authentication documentation](https://open.fda.gov/apis/authentication/).

## Units and denominators

| Dataset              | Unit / denominator rule                                                                                                | Important restriction                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ADR leaderboard      | Distinct retained report IDs mentioning each reaction; denominator is all retained reports under the displayed filters | A report can contribute to several reaction bars; sum of bars need not equal cohort size                      |
| Seriousness          | One report-level serious/non-serious/unknown category per report                                                       | Unknown is not non-serious                                                                                    |
| Seriousness criteria | Per-report death, hospitalization, life-threatening and other flags                                                    | Flags overlap; do not use a mutually exclusive donut unless a declared hierarchy creates exclusive categories |
| Reaction outcome     | Outcome attached to a reaction entry                                                                                   | Do not confuse with report-level seriousness flags                                                            |
| Usage                | Distinct report–normalized-indication pairs from matched spironolactone entries                                        | Several indications can occur per report; pair proportions are not patient or prescribing prevalence          |
| Publications         | Unique PMID per topic and publication year                                                                             | Topics overlap; publication counts are not evidence grades                                                    |
| Trials               | Unique NCT ID per topic and start year                                                                                 | Several conditions/phases can occur per study; record the chart's counting rule                               |
| Labels               | Product–jurisdiction–indication–population entry                                                                       | Not a frequency measure; formulation and document version matter                                              |

If a mutually exclusive report-level usage chart is wanted, derive explicit `labelled-only`, `off-label-only`, `mixed`, `unspecified`, and `undetermined` categories and document precedence. Do not force mixed or insufficiently documented records into the PRD's proposed three-way donut.

## Cleaning rules to implement

- Keep unknown, unreported and unresolved values visible. Never replace missing counts or failed requests with zero.
- Preserve sex as reported in the source; do not infer gender identity or off-label indication from it.
- Convert age using the documented unit codes before assigning bands. Proposed bands are `<18`, `18–44`, `45–64`, `65–74`, `75+`, and `unknown`. Preserve raw age/unit and flag implausible values for review; document any approximation for day/month units.
- Use `occurcountry` for event-country charts and retain reporter/source country separately. Do not substitute one silently for the other.
- Store label status as a classification relative to a named reference product/jurisdiction/version, not as proof the actual prescription was approved. Missing population/formulation/qualifiers may require `undetermined`.
- Hirsutism, acne and infertility are different PCOS-related topics. PMS is not interchangeable with PMDD. Proteinuria benefit is not interchangeable with cardiovascular benefit in CKD.
- Preserve original reaction terms. Do not invent MedDRA SOC assignments from free text; require an authorized hierarchy and version, or label a separate manual body-system mapping honestly.
- Combination products stay separate from single-ingredient products in the primary analysis. Document any later pooled sensitivity analysis.

## Research search templates

PubMed base:

```text
(spironolactone[MeSH Terms] OR spironolactone[Title/Abstract]) AND ("1900/01/01"[Date - Publication] : "2025/12/31"[Date - Publication])
```

Append `AND (<topic expression>)`. These are draft sensitivity-oriented strings, not validated systematic-review searches:

| Topic                            | Exact topic expression                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Acne                             | acne[Title/Abstract]                                                                                                          |
| Hirsutism / PCOS                 | hirsutism[Title/Abstract] OR "polycystic ovary syndrome"[Title/Abstract] OR PCOS[Title/Abstract]                              |
| Female pattern hair loss         | "female pattern hair loss"[Title/Abstract] OR "androgenetic alopecia"[Title/Abstract]                                         |
| HFpEF                            | "preserved ejection fraction"[Title/Abstract] OR HFpEF[Title/Abstract]                                                        |
| Resistant hypertension           | "resistant hypertension"[Title/Abstract]                                                                                      |
| Gender-affirming therapy         | transgender[Title/Abstract] OR "gender affirming"[Title/Abstract] OR feminizing[Title/Abstract] OR feminising[Title/Abstract] |
| Central serous chorioretinopathy | "central serous chorioretinopathy"[Title/Abstract]                                                                            |
| Hidradenitis                     | "hidradenitis suppurativa"[Title/Abstract]                                                                                    |
| PMS / PMDD discovery             | "premenstrual syndrome"[Title/Abstract] OR "premenstrual dysphoric disorder"[Title/Abstract]                                  |
| Proteinuria / CKD discovery      | proteinuria[Title/Abstract] OR "chronic kidney disease"[Title/Abstract]                                                       |

Retain PubMed's query translation, warnings, PMID set and date field. Screen population-specific matches after retrieval; broad terms can retrieve irrelevant populations. Validate sensitivity against the known seed papers and precision on a review sample. The PMS/PMDD and CKD discovery results must be separated during evidence appraisal. Make no more than three unauthenticated NCBI requests per second. [NCBI usage guidance](https://www.ncbi.nlm.nih.gov/books/NBK25497/).

For ClinicalTrials.gov, start with `query.intr=spironolactone`, follow `nextPageToken` and retain `protocolSection` fields. Check intervention names/other names and eligibility rather than trusting a keyword match alone. Group conditions with the same reviewed topic dictionary used for literature. Keep studies with missing phase/status/date in explicit unknown categories. Trial registrations do not establish efficacy.

## Phase 2 export gate

Before anything enters `public/data/`, require: a complete extraction audit; stable deduplicated units; same-entry suspect filtering; explicit unknown/mixed states; reviewed mapping decisions; reference-product label status; valid source IDs and ISO dates; finite nonnegative integer counts; denominator definitions; overlap/completeness metadata; and a runtime schema validator. The TypeScript contracts are a draft compile-time description and are not sufficient to validate JSON by themselves.
