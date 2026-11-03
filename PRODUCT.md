# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: pharmacy peers and evaluators arriving from a shared project link, presentation or LinkedIn post. The confirmed primary job is to understand the evidence-led story in about 60 seconds, then explore the underlying sources, methods and data.

Secondary: curious public readers who need plain-language context and clear limits, and students who want more detailed evidence appraisal.

## Product Purpose

Spironolactone Atlas is an educational, single-page study of spironolactone uses, research evidence, adverse-event reporting and label-derived interactions. It makes the evidence understandable while keeping every substantive number traceable to its source, retrieval date, denominator and method.

Success means quick comprehension followed by voluntary deeper exploration, inspectable methodology and data, accessible use on mobile and desktop, and a shareable demonstration of the author's research and analysis.

## Positioning

The project connects product-specific label scope, a reproducible reporting-data cohort, research-discovery counts and endpoint-specific evidence appraisal. It explains where those sources agree, differ or cannot answer a question. Reporting frequency, treatment risk, regulatory approval and strength of evidence remain distinct concepts.

## Operating Context

- Static public website, reached through a shared URL; no accounts, backend or collection of visitor health information.
- Offline Python pipeline exports static JSON/CSV; visitors can inspect underlying tables, sources and methodology.
- Current reporting window: first FDA receipt 2004–2025; retrieval snapshot 3 November 2026. A complete retrieval is not proof of exhaustive brand/spelling recall or complete spontaneous reporting.
- Existing code is Vite, React, strict TypeScript and Tailwind CSS v4, with npm. The current App is a toolchain placeholder and supplies no established visual identity.
- Major completed updates are committed and pushed to https://github.com/adarsh-gautam-sys/Spironolactone-Atlas.

## Capabilities and Constraints

- Single-page narrative with section wayfinding, responsive data exploration, evidence-topic details, product/jurisdiction comparisons and a searchable interaction reference.
- Charts use exported data, with takeaway, named source, retrieval date, denominator and underlying table access. Preserve source-specific distinctions and unknown values.
- Use `motion/react` for purposeful motion. React Bits may supply selected signature effects, with a maximum of six components across the site. Check each dependency and bundle cost before installation. None is installed yet.
- Motion must respect reduced-motion preferences, and expensive/WebGL effects need bounded use and static alternatives. Lenis is available; activation is optional and must preserve native navigation and accessibility.
- Binding technical targets from the PRD: mobile-first, 360–1920 px; WCAG AA; Lighthouse mobile performance/accessibility/SEO targets 85/95/95; LCP under 2.5 seconds; initial JavaScript around 250 KB gzip or less.
- Educational use only; no dosing advice, patient-specific recommendations, causal claims from spontaneous reports or implied clinical decision support.
- Replace the proposed off-label prescribing-share donut with indication completeness and explicitly named topic counts. Source-term matches do not establish real-world prescribing prevalence or confirmed label status.
- Separate report-level seriousness, overlapping seriousness criteria and reaction-level outcomes. Co-reported drug names are not a measured interaction-risk ranking.
- India-specific approval comparisons and a MedDRA SOC/body-map output remain unresolved. Do not fabricate those inputs or imply that a missing source means a use is unapproved.
- Current authorization is Impeccable **shape**: planning and a brief for review. Website implementation follows a later instruction.

## Brand Commitments

Preserve the name Spironolactone Atlas and the PRD's clinical precision, editorial storytelling and calm, confident voice. The supplied PRD's section 8 is the visual-direction input; shape will resolve its composition and motion with the user rather than treating the placeholder as a design system. No logo, existing campaign assets or finished website identity has been supplied.

## Evidence on Hand

- `docs/PRD.md`: original requirements, retained unchanged; seed medical content is not automatically verified fact.
- `docs/CONTENT_DECISIONS.md`: analytical corrections to the original proposed content and visuals.
- `public/data/manifest.json`: twelve JSON/CSV export pairs with hashes, sources, dates, units and limitations in their data envelopes.
- `docs/PHASE_3_ANALYSIS.md`: descriptive findings and reporting-data limits; selected cohort contains 24,805 retained reports.
- `docs/EVIDENCE_APPRAISAL.md` and `data-pipeline/clean/evidence-appraisal.json`: ten targeted, scoped appraisals. A/B/C are project summaries, not formal GRADE or approval decisions. Preserve endpoint direction and review/access limitations beside badges.
- `docs/INSIGHT_SHORTLIST.md`: five sourced candidates for narrative takeaways.
- `data-pipeline/METHODOLOGY.md`: query history, reconciliation and reproduction details.
- `docs/figures/`: analytical draft figures, not a visual-system reference or approved website design.
- No testimonials, clinical validation claims, verified India label or licensed MedDRA hierarchy is available to invent into the experience.

## Product Principles

- Lead with understanding, then make deeper exploration easy to find.
- Keep claims proportionate to what the named source can establish.
- Treat unknowns, missingness and negative or mixed evidence as content.
- Make provenance and underlying data part of the reading experience.
- Use interaction and motion to explain meaning and sequence.

## Accessibility & Inclusion

Support keyboard navigation, visible focus, semantic landmarks, accessible data-table alternatives and readable text summaries. Charts must not rely on colour alone. Respect OS reduced-motion settings and avoid hiding essential content behind animation. Retain a useful experience without smooth scrolling or heavy visual effects.
