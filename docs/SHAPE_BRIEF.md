# Confirmed design brief

Confirmed by the user's “yea proceed” after the seven-point brief. This document records planning decisions, not a code-level direction contract or an approved final composition.

1. **Audience and outcome:** Pharmacy peers and evaluators should understand the main evidence story in about 60 seconds, then explore sources, methods and data. The surface is in Read mode.
2. **Visual direction:** Clinical Editorial Standard: deep ink background, off-white text, coral emphasis and restrained teal accents. Fraunces headings, Inter body text and JetBrains Mono annotations support a familiar editorial hierarchy. No additional comparator sites were supplied; the selected decision mockup is the visual benchmark for this round.
3. **Reading sequence:** Introduction, medicine context and mechanism, uses and evidence, reporting observations, research activity, interactions, then methods and sources. “Read the story” and “Explore data” provide two entry points.
4. **Data and interaction:** Use the validated static exports. Charts retain source, retrieval date, denominator, limitations and table access. Evidence details and the interaction reference support deeper exploration. Loading failures, empty results and unavailable sources remain distinct; missing values never become zero.
5. **Motion and React Bits:** Use `motion/react` for restrained entrances, chart transitions and reading progress. Plan CountUp for one cohort figure and BlurText for a short introductory headline. Other components need a clear purpose; six remains the ceiling. Reduced-motion mode shows complete content immediately. No React Bits components are installed during the composition round.
6. **Responsive behavior:** Desktop comparisons become readable stacked groups on mobile. Navigation, filters and disclosures work by keyboard and touch. Charts have text/table alternatives; meaning never depends on colour alone. Preserve native anchors, focus and browser navigation; Lenis remains optional.
7. **Boundaries:** Preserve the existing pipeline and medical-source safeguards. India-specific approval and SOC mapping remain unresolved. No invented facts, dosing advice, causal reporting claims or implied prescribing prevalence. The composition round contains the selected mockup plus two variations. The user subsequently approved Option 1 for Phase 5 implementation.

## Material content and delivery constraints

- Existing material: twelve validated JSON/CSV dataset pairs, ten bounded evidence appraisals and the 24,805-report selected cohort. Charts preserve distinct source scopes and overlapping categories. Long reaction-term lists need bounded summaries and searchable/paginated tables rather than thousands of visible bars.
- Current reporting window is 2004–2025; retrieval snapshot is 3 November 2026. Reporting frequency is not incidence or causality. Project evidence grades remain accompanied by population, endpoint direction, source and review scope.
- Mobile-first range: 360–1920 px; WCAG AA; target Lighthouse mobile performance/accessibility/SEO 85/95/95, LCP below 2.5 seconds and initial JavaScript around 250 KB gzip or less. These are targets to verify during the implementation and quality phases.
- Native image generation produced composition variations 2 and 3, using the selected decision image as an identity reference. Option 1 reuses that image unchanged. Exact prompts and provenance travel with each PNG and its JSON sidecar.
- Option 1 is approved; Options 2 and 3 remain unapproved. Generated chart geometry and illustrative navigation selection are defects to correct from the real data and current section when implementing; they are not quantitative authority.

## Composition review

- Option 1: `.impeccable/mocks/composition/01-clinical-editorial.png`
- Option 2: `.impeccable/mocks/composition/02-explanation-beside-evidence.png`
- Option 3: `.impeccable/mocks/composition/03-guided-chapter-reading.png`

The user approved Option 1, Clinical Editorial, without a revision note. The response is recorded in `.impeccable/shape/composition-choice.json`; see `PHASE_4_DESIGN.md` for the implementation handoff.
