# Phase 3 — targeted evidence appraisal

Reviewed 3 November 2026. Project badges are bounded editorial summaries, not formal GRADE ratings, regulatory approval decisions or prescribing recommendations. Grades must retain their source scope and limitations when used in medical interpretation.

A = strong support for a specified endpoint in the appraised evidence. B = moderate/mixed evidence with material limits. C = emerging/limited evidence. A higher-quality study can show no benefit; the direction field must always accompany a badge. Sources and review scope are recorded in [the appraisal JSON](../data-pipeline/clean/evidence-appraisal.json). This review is targeted rather than exhaustive through 2026.

## acne — B

Patient-reported acne improvement in adult women, alongside permitted topical treatment.

Design: Pragmatic blinded placebo-controlled RCT plus official guideline summary.

Bias and precision: Independent randomization and masking reported; modified intention-to-treat analysis with missing-data sensitivity analysis. Primary improvement was modest and its clinically important threshold uncertain.

Applicability: Adult women; later follow-up showed larger differences. Do not generalize to every age, sex or acne presentation.

Interpretation: Supported option in the studied population, with conditional guideline context; project grade B reflects remaining certainty and applicability limits.

Sources: [SAFA](https://www.bmj.com/content/381/bmj-2022-074349) (Full-text methods, endpoints, missing-data handling and limitations), [AAD2024](https://www.aad.org/news/updated-guidelines-acne-management) (Official guideline summary; hormonal therapy recommendations).

## hirsutism-pcos — C

Hirsutism management in PCOS, rather than treatment of all PCOS manifestations.

Design: Official evidence-based guideline recommendations.

Bias and precision: The relevant PCOS antiandrogen recommendation has very-low-certainty evidence; recommendation strength is not equivalent to strong trial evidence.

Applicability: Hirsutism-specific context, with pregnancy-prevention restrictions and previous-treatment qualifications retained in the source.

Interpretation: A guideline-supported conditional role with limited underlying evidence; no blanket PCOS efficacy or approval claim.

Sources: [PCOS2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/) (Recommendations 4.6 and evidence-certainty context), [HIRSUTISM2018](https://www.endocrine.org/clinical-practice-guidelines/hirsutism) (Official recommendation summary).

## hair-loss — C

Additional benefit for female pattern hair loss when added to topical minoxidil.

Design: Small blinded placebo-controlled pilot RCT.

Bias and precision: Randomization and allocation concealment reported; 48 randomized with attrition. Primary hair-count comparison did not meet the conventional significance threshold, while photographic secondary outcomes favored treatment.

Applicability: Premenopausal women and combination treatment; not evidence for spironolactone monotherapy or all alopecia.

Interpretation: Promising but imprecise, endpoint-dependent evidence; the PRD's observational-only seed is outdated.

Sources: [FPHL2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12448166/) (Full-text randomization, outcomes, attrition and limitations).

## hfpef — B

TOPCAT primary composite outcome in heart failure with preserved ejection fraction.

Design: Large blinded randomized placebo-controlled trial; abstract-level appraisal here.

Bias and precision: The primary confidence interval crossed the null. Secondary hospitalization findings must not replace the primary outcome; full-text bias, regional and subgroup appraisal remains incomplete.

Applicability: Specific trial EF/population definition; cannot borrow the reduced-EF label or generalize subgroup findings to all HFpEF.

Interpretation: No significant reduction in the overall primary composite; retain secondary signals as qualified context rather than a positive headline.

Sources: [TOPCAT](https://pubmed.ncbi.nlm.nih.gov/24716680/) (Primary trial abstract; full-text risk-of-bias appraisal not completed).

## resistant-hypertension — A

Short-term home blood-pressure reduction as add-on therapy in resistant hypertension.

Design: Blinded randomized crossover comparison against placebo and two active drugs.

Bias and precision: Randomization/masking reported and hierarchy of blood-pressure comparisons specified. Participants without follow-up were excluded and missing-at-random assumptions apply.

Applicability: Short exposure, selected kidney-function eligibility and predominantly white participants limit extrapolation. Cardiovascular outcome benefit was not the measured endpoint.

Interpretation: Strong evidence for the specified BP endpoint, not long-term outcome superiority. This use is not automatically off-label under the US add-on hypertension indication.

Sources: [PATHWAY2](https://pmc.ncbi.nlm.nih.gov/articles/PMC4655321/) (Full-text randomization, crossover outcomes, missing-data assumptions and applicability).

## gender-affirming — B

Breast development with spironolactone versus cyproterone alongside estradiol.

Design: Small blinded active-comparator randomized trial plus official guideline summary.

Bias and precision: Independent randomized allocation and masking reported; short follow-up, limited sample and measurement limitations reduce certainty. A nonsignificant difference is not proof of equivalence.

Applicability: Comparative treatment with concomitant estradiol; cannot establish the independent absolute contribution of spironolactone to all feminising outcomes.

Interpretation: Direct comparative evidence now exists, but endpoints and regimen context must remain explicit; project grade B is scoped to that comparison.

Sources: [GENDER2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12086416/) (Full-text active-comparator randomization, blinding, primary outcome and measurement limits), [ENDO2017](https://www.endocrine.org/clinical-practice-guidelines/gender-dysphoria-gender-incongruence) (Official guideline summary; publisher full text was access-limited).

## central-serous — C

Anatomical fluid reduction versus visual benefit in persistent central serous chorioretinopathy.

Design: Small blinded randomized crossover study.

Bias and precision: Very small sample, short treatment periods and carryover concerns. Anatomical fluid measures improved while visual-acuity differences were not significant.

Applicability: Persistent disease in the selected study eyes; no established broad visual benefit from this source set.

Interpretation: Emerging anatomical signal, not sufficient evidence for an unqualified clinical-benefit claim.

Sources: [CSC2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4697359/) (Full-text crossover design, anatomical and visual outcomes, carryover limitations).

## hidradenitis — C

Treatment response in women with hidradenitis suppurativa.

Design: Single-center retrospective cohort.

Bias and precision: No randomized untreated comparator; confounding by severity, co-treatment, selection and response assessment are material. Association is not a causal treatment effect.

Applicability: Selected clinical cohort; severe disease and response definitions affect findings.

Interpretation: Limited observational evidence; do not use response percentages as generalized efficacy estimates.

Sources: [HS2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11216665/) (Full-text retrospective design, response definition and limitations).

## pms-pmdd — C

PMS symptoms in the historical trial population, not a PMDD efficacy claim.

Design: Small placebo-controlled crossover study; abstract-only appraisal.

Bias and precision: Small sample and reported carryover; full allocation, attrition and analysis methods were not available for appraisal.

Applicability: Historical PMS diagnosis and symptom measures cannot be assumed to establish efficacy for modern PMDD criteria.

Interpretation: Limited PMS signal; keep PMDD ungraded and avoid extending this badge to a PMDD treatment claim.

Sources: [PMS1995](https://pubmed.ncbi.nlm.nih.gov/8533564/) (Abstract only; full methods inaccessible in this review).

## proteinuria-ckd — C

Proteinuria reduction in CKD; separate from cardiovascular protection.

Design: Open-label randomized proteinuria study (abstract) plus a larger cardiovascular-outcome trial (full text).

Bias and precision: Proteinuria is a surrogate and the earlier study was open-label. BARACK-D did not demonstrate cardiovascular benefit in its population and had substantial treatment discontinuation; it recruited below its original target.

Applicability: Different populations and endpoints cannot be pooled into one CKD-benefit conclusion; evidence for other mineralocorticoid antagonists is not interchangeable.

Interpretation: Limited evidence for the proteinuria question; preserve the separate negative cardiovascular result as context. No blanket CKD benefit or prescribing recommendation.

Sources: [PROTEINURIA2006](https://pubmed.ncbi.nlm.nih.gov/17035949/) (Primary abstract; open-label design and surrogate endpoint), [BARACKD](https://www.nature.com/articles/s41591-024-03263-5) (Full-text design, primary endpoint, treatment discontinuation and limitations).
