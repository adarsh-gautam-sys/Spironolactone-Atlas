# Content decisions after Phase 3

This is an analytical addendum to the original PRD; the supplied PRD remains unchanged. These decisions should guide the subsequent design review.

- Use **reported reaction terms**, with source/date and report denominator, for the leaderboard. The source includes administrative and effectiveness terms as well as clinical events. Do not present every term as a proven adverse reaction caused by spironolactone.
- Replace the proposed labelled/off-label/unspecified prescribing-share donut with **indication completeness and report-level topic counts**. More than half of this cohort has no informative indication. Topic matches require qualifiers and are relative to a named reference label; no reliable off-label prescribing percentage is established.
- Keep seriousness categories separate from overlapping seriousness criteria and reaction-level outcomes. A death flag is not drug-attributable mortality. Show counts and an underlying data view, not an unqualified outcome donut.
- Display subgroup denominators alongside reaction shares. Differences by reported sex or age are unadjusted reporting observations; source selection, disease and co-treatment confound them. Avoid causal risk language.
- Show publication/trial counts as **research discovery activity**. Do not total overlapping topic counts as unique studies, equate trial completion with positive evidence, or headline ratios from tiny early baselines. In particular, query vocabulary and indexing can change over time.
- Pair every A/B/C evidence badge with its question, population, direction and source scope. The badge is a project summary rather than formal GRADE. Negative primary outcomes and abstract-only assessments must remain visible. These bounded editorial grades must not be presented as validated clinical recommendations.
- Keep the label-derived interaction reference separate from FAERS co-reported drug-name counts. Raw names have unresolved brand aliases and do not measure interaction risk. No PRR/ROR or independent risk-factor estimate is supported by this extraction.
- Restrict regional comparisons to the named product documents. The India label remains unresolved. A MedDRA SOC view remains unavailable until a permitted hierarchy/version is supplied; a manual body-system alternative would need its own reviewed mapping and honest label.
- Preserve the current setup placeholder through Phase 3. Analytical PNG/SVG figures are research artifacts and do not set website tokens, typography or layout.

The source data, uncertainties and draft takeaways are documented in [the analysis](PHASE_3_ANALYSIS.md), [appraisal](EVIDENCE_APPRAISAL.md) and [insight shortlist](INSIGHT_SHORTLIST.md).
