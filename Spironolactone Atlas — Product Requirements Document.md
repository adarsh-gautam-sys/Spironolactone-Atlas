# Spironolactone Atlas — Product Requirements Document

Project 1 · Drug Utilisation and Pharmacovigilance Visual Study · Drug of choice: Spironolactone · Version 1.0 · 3 November 2026

## 1. Summary

Spironolactone Atlas is a single-page, scroll-driven, animated website that collates public data on spironolactone: its approved indications, off-label uses, adverse drug reactions (ADRs) and drug interactions. The data is cleaned, analysed and shown as interactive charts, tables and infographics. The site is hosted on a sub-domain and promoted with a LinkedIn post (plus carousel) that shares the key insights.

One-line pitch: every use of spironolactone, on-label and off-label, and what it can cost the patient, in a single scroll.

## 2. Brief-to-product mapping

| Requirement in the project brief | How the product delivers it |
| --- | --- |
| Capture data for ADR | FDA FAERS reports via openFDA, ADR tables from the product label, incidence figures from key trials |
| Capture indications and usages | Approved indications compared across FDA label, UK SmPC and Indian (CDSCO) information |
| Capture off-label usages | Literature and trial registry counts, plus the real-world indication field in FAERS, each use graded by evidence level |
| Collate and analyse | Python pipeline produces clean JSON and runs descriptive statistics (and optional disproportionality analysis) |
| Meaningful graphs, tables, infographics | 12+ visuals listed in section 6 |
| Share in a web page on a sub-domain | Static React site on Vercel, Netlify or Cloudflare Pages with a custom sub-domain |
| Share insights on LinkedIn | Carousel and post plan in section 12 |

## 3. Goals, non-goals and success metrics

**Goals**

- G1 Accuracy: every number traces to a named source and a retrieval date.
- G2 Clarity: a layperson understands the story in 60 seconds, a pharmacy student can drill into the detail.
- G3 Delight: motion explains rather than decorates, and the site feels premium.
- G4 Reach: the LinkedIn post earns saves, shares and conversations with peers and mentors.

**Non-goals**

- Not clinical decision support. No dosing advice, no patient-specific guidance.
- No user accounts, no backend, no collection of patient data.
- No claim of causality from spontaneous-report data.

**Success metrics**

| Metric | Target |
| --- | --- |
| Lighthouse (mobile) performance / accessibility / SEO | 85+ / 95+ / 95+ |
| Sourced figures | 100% of numbers have source and date |
| Distinct visuals | 12 or more |
| LinkedIn carousel | 8 to 10 slides, published within a week of launch |
| Evaluator feedback | Meets or exceeds rubric on data depth, analysis and presentation |

## 4. Audience

| Persona | Need | Design implication |
| --- | --- | --- |
| Evaluator / professor | Proof of data capture, method and critical thinking | Visible methodology, source footnotes, downloadable data |
| Peers and recruiters on LinkedIn | A quick, impressive, shareable story | Strong hero, insight cards, OG image, mobile-first |
| Curious patient or public | Plain-language understanding | Mechanism animation, plain labels, clear disclaimer |

## 5. Data strategy

### 5.1 Sources

| Source | Used for | Access |
| --- | --- | --- |
| openFDA drug adverse event API (FAERS) | Top reactions, seriousness, outcomes, age, sex, year, country, reported indication | Free API, key recommended |
| DailyMed / FDA label (Aldactone, Carospir) | Approved indications, ADR tables, contraindications, warnings, interactions | Public |
| UK SmPC (emc) and CDSCO / Indian brand information | Regional indication comparison, Indian brands | Public |
| PubMed E-utilities | Publication counts by year and by off-label topic | Free API |
| ClinicalTrials.gov API v2 | Trial counts by condition, phase, status, start year, country | Free API |
| Key trials and guidelines | Evidence grading for off-label uses | Papers, guideline documents |
| WHO VigiAccess (manual reference only) | Cross-check global reporting trend | Manual lookup, no scraping |

### 5.2 Data points to capture

- ADR: preferred term, MedDRA system organ class, report count, seriousness, outcome, sex, age band, report year, country, co-suspect drugs.
- Indications: indication text, regulator, labelled or off-label status, population (adult or paediatric), evidence level, key trial or guideline.
- Usage: reported indication in FAERS mapped to a clean condition list, publication and trial counts per condition.
- Interactions: interacting drug or class, effect, severity, mechanism, management note from the label.

### 5.3 Pipeline

1. Extract: Python scripts call each API and save raw JSON in `data/raw/` with a timestamp.
2. Clean: normalise names (spironolactone, Aldactone, Carospir, Aldactazide, Lasilactone), merge synonyms in indication and reaction text, drop empty or junk values.
3. Map: map free-text indications to a curated condition list, flag each as labelled, off-label or unspecified. Map reactions to MedDRA system organ class.
4. Analyse: counts, proportions, rankings, year trends, sex and age splits. Stretch goal: PRR and ROR disproportionality for top reactions.
5. Export: write small, typed JSON files to `public/data/` that the site reads directly.
6. Document: log every query, date and filter in `METHODOLOGY.md`.

### 5.4 Questions the analysis should answer (these become the insights)

- Q1 Which ADRs dominate reports, and do they differ by sex and age?
- Q2 What share of real-world reported use is outside the labelled indications?
- Q3 Is off-label research growing, and which uses are rising fastest?
- Q4 How serious are the reports, and what outcomes are recorded?
- Q5 Which interacting drugs and risk factors recur in hyperkalaemia reports?
- Q6 Do the Indian label and the FDA or UK label differ in indications or warnings?

State findings as observations from the data. Never write the answers before running the numbers.

### 5.5 Limitations that must appear on the site

- FAERS is spontaneous reporting. It cannot give incidence or prove causality, and it carries under-reporting, stimulated reporting and duplicate-report bias.
- A report listing spironolactone does not mean it caused the event, especially when many drugs are co-reported. Filter to suspect-drug reports and say so.
- openFDA cannot always match a reaction to the same drug entry, so counts can include co-reported drug effects.
- Reported indication is free text entered by reporters, so mapping involves judgement.
- Publication and trial counts depend on search strings. Publish the exact strings.

## 6. Content and information architecture

| # | Section | Purpose | Visuals and interactions |
| --- | --- | --- | --- |
| 1 | Hero | Hook | Animated headline, abstract molecule or tablet visual, four headline stats with count-up |
| 2 | Drug at a glance | Context | Cards for class, year of approval, brands, forms and strengths, mechanism in one line |
| 3 | Mechanism | Explain | Animated nephron diagram: aldosterone, receptor, sodium and potassium handling, with a toggle for the anti-androgen effect |
| 4 | Approved indications | Core | Indication cards with regulator tabs (FDA, UK, India), comparison table |
| 5 | Off-label explorer | Core | Filterable tile grid with evidence badges (A strong, B moderate, C emerging) and a detail drawer |
| 6 | Real-world usage | Analysis | Donut or treemap of FAERS reported indications: labelled, off-label, unspecified |
| 7 | Research momentum | Analysis | Line or stream chart of publications by topic and year, trials by phase and status |
| 8 | ADR leaderboard | Core | Ranked bar chart of top reactions with filters for seriousness, sex and age band |
| 9 | ADRs by organ system | Infographic | Body-map infographic and organ-system heatmap |
| 10 | Seriousness and outcomes | Analysis | Outcome donut, reports by year line chart, age histogram |
| 11 | Hyperkalaemia deep dive | Focus | Risk-factor infographic, interaction matrix, monitoring timeline |
| 12 | Interactions table | Reference | Sortable and searchable table with severity chips |
| 13 | Key insights | Synthesis | Five insight cards (stack or swap animation), each linked to the chart behind it |
| 14 | Methodology and limitations | Trust | Accordion, source table, last-updated stamps, data download |
| 15 | References and disclaimer | Close | Reference list, medical disclaimer, author credit, LinkedIn link |

Every chart block follows one pattern: title, one-sentence takeaway, chart, source and date footnote, and a View data toggle that shows the underlying table.

## 7. Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Single-page scroll layout with a floating section navigation | Must |
| FR-02 | All charts render from static JSON in `public/data/` | Must |
| FR-03 | Each chart has title, takeaway, source and date footnote, and a data-table toggle | Must |
| FR-04 | Off-label explorer filters by evidence level and body system, with a detail drawer | Must |
| FR-05 | ADR chart filters by seriousness, sex and age band | Should |
| FR-06 | Animated mechanism-of-action diagram | Must |
| FR-07 | Sortable, searchable interactions table | Should |
| FR-08 | Download cleaned datasets as CSV | Should |
| FR-09 | Open Graph image, title and description for link previews | Must |
| FR-10 | Reduced-motion mode that respects the OS setting | Must |
| FR-11 | Visible educational-use disclaimer | Must |
| FR-12 | Methodology section with queries and retrieval dates | Must |
| FR-13 | Dark and light theme | Could |
| FR-14 | Privacy-friendly analytics (Plausible or Umami) | Should |
| FR-15 | Print-friendly summary view | Could |

## 8. Design direction

### 8.1 Visual identity

- Mood: clinical precision meets editorial storytelling. Calm, confident, a little cinematic.
- Default theme: deep ink background (around #0B1020), soft off-white text, coral accent for primary highlights, teal for positive or therapeutic information, amber and red reserved strictly for risk and warnings.
- Typography: a characterful serif for display (Fraunces or Instrument Serif), a clean sans for body (Inter or Geist), a mono face for numbers and sources (JetBrains Mono).
- Charts: one consistent colour language. Colour-blind-safe palette, never colour alone, always labels or patterns.

### 8.2 Motion principles

- Motion explains: reveal order follows reading order and data meaning.
- Use Framer Motion (the `motion` package) for layout, scroll, SVG and chart animation. Use React Bits for a small number of signature effects.
- Spring-based easing, short durations (200 to 600 ms), one hero moment per section at most.
- Every animation has a reduced-motion fallback. WebGL backgrounds are lazy-loaded and switched off on low-power or small screens.

### 8.3 Animation map

| Section | Framer Motion | React Bits |
| --- | --- | --- |
| Hero | Staggered entrance, parallax on the visual, scroll-linked fade | Aurora or Particles background, SplitText or BlurText headline, ShinyText tagline |
| Headline stats | useInView trigger, card hover lift | CountUp numbers |
| Mechanism | SVG pathLength drawing, step-through with AnimatePresence, toggle with layoutId | None, keep it clean |
| Indications and off-label | layoutId tab pill, animated filtering with layout animations, drawer transitions | SpotlightCard or MagicBento tiles |
| Research momentum | useScroll and useTransform for line draw and counters | ScrollReveal for narrative text |
| ADR charts | Bars grow on view, staggered rows, animated filter transitions | None, charts stay readable |
| Body map | Hover and tap highlight, animated organ glow | None |
| Key insights | Scroll-driven card reveal | Stack or CardSwap |
| Global navigation | Active-section indicator with layoutId | Dock as floating section nav |
| Footer or interlude | Marquee strip of ADR terms | ScrollVelocity |

Budget: no more than 6 React Bits components in total. Several rely on GSAP, OGL or Three.js, so check each one's bundle cost before adding it.

## 9. Technical architecture

| Layer | Choice |
| --- | --- |
| Framework | Vite, React and TypeScript (Next.js static export is an acceptable alternative) |
| Styling | Tailwind CSS with design tokens as CSS variables |
| Animation | `motion` (Framer Motion) with `motion/react` imports, optional Lenis for smooth scroll |
| Signature effects | React Bits components, copied into the repo through its CLI or registry (check reactbits.dev for the current command) |
| Charts | Recharts for standard charts, D3 for custom pieces such as the body map, Sankey or heatmap |
| Tables | TanStack Table |
| Data pipeline | Python with requests and pandas, run offline, output committed as JSON |
| Hosting | Vercel, Netlify or Cloudflare Pages |
| Quality | ESLint, Prettier, Lighthouse CI, axe for accessibility checks |

Suggested structure:

- `data-pipeline/` Python scripts, raw and cleaned data, METHODOLOGY.md
- `src/components/ui/` React Bits components and shared UI
- `src/components/charts/` one component per visual, each reading a JSON file
- `src/sections/` one file per section from section 6
- `public/data/` final JSON and CSV files

## 10. Non-functional requirements

- Performance: LCP under 2.5 s on mid-range mobile, initial JavaScript under about 250 KB gzipped, heavy visuals lazy-loaded.
- Accessibility: WCAG AA contrast, keyboard navigable, charts have text summaries and data-table alternatives, focus states visible.
- Responsive: 360 px to 1920 px, with chart layouts redesigned for mobile rather than shrunk.
- SEO and sharing: semantic HTML, meta tags, Open Graph and Twitter card image, sitemap.
- Privacy: no cookies, no personal data, no third-party trackers beyond privacy-friendly analytics.
- Trust: last-updated date in the footer and a medical disclaimer on first view and in the footer.

## 11. Deployment

1. Push the repo to GitHub (public, so the method is inspectable).
2. Connect it to Vercel, Netlify or Cloudflare Pages for automatic builds.
3. Add the custom sub-domain, for example spironolactone.yourdomain.com, using a CNAME record. If the college provides the sub-domain, share the built `dist/` folder or the repo link with them.
4. Confirm HTTPS, the Open Graph preview (test with a LinkedIn Post Inspector) and the Lighthouse scores before posting.

## 12. LinkedIn plan

**Format:** a 8 to 10 slide carousel (PDF, 1080 by 1350) plus a short text post with the site link.

**Carousel outline**

1. Hook slide: a surprising finding from the data.
2. What spironolactone is and how it works.
3. Approved uses at a glance.
4. The off-label story with evidence levels.
5. Real-world usage split.
6. Top reported ADRs.
7. The hyperkalaemia lesson and monitoring.
8. Three insights.
9. Method and limitations in one slide.
10. Call to action: explore the full interactive site.

**Post template (fill with real numbers after analysis)**

- Line 1 (hook): I analysed \[N\] adverse event reports and \[N\] studies on spironolactone. Here is what stood out.
- Lines 2 to 5: three short insights, each with one number and one plain-language meaning.
- Line 6: what the data cannot tell us (one sentence on spontaneous-report limits).
- Line 7: link to the site and a thank-you to the mentor or college.
- Closing: educational project, not medical advice. 3 to 5 hashtags such as #Pharmacovigilance #Pharmacy #DrugSafety #DataViz.

**Tips:** post on a weekday morning IST, tag your mentor or institution, reply to early comments quickly, and test whether putting the link in the first comment changes reach.

## 13. Milestones (7-day plan)

| Day | Deliverable |
| --- | --- |
| 1 | Source review, API tests, evidence list for indications and off-label uses |
| 2 | Extraction and cleaning scripts, first JSON files |
| 3 | Analysis, charts drafted in notebook, insight shortlist |
| 4 | Design system, layout, sections 1 to 5 built |
| 5 | Sections 6 to 12 built, animations added |
| 6 | Insights, methodology, accessibility and performance pass |
| 7 | Deploy, LinkedIn carousel, publish |

## 14. Risks

| Risk | Mitigation |
| --- | --- |
| Misreading FAERS as incidence | Use the word reports, show limitations beside charts |
| Label facts remembered wrongly | Copy figures from the current label or paper, record page and date |
| Animation overload | Motion budget, React Bits cap, reduced-motion mode |
| Heavy WebGL on phones | Lazy load, static fallback below a width or power threshold |
| API rate limits | Cache raw responses, use an openFDA key |
| Time overrun | Cut Could items first (theme toggle, print view, PRR analysis) |

## 15. Acceptance criteria

- All Must requirements are working on mobile and desktop.
- Every chart shows a source and a retrieval date.
- Methodology section lists queries, filters and limitations.
- Lighthouse targets from section 3 are met.
- Reduced-motion mode works.
- LinkedIn carousel is exported and the post is ready to publish.

## Appendix A. Seed content to verify against current sources

These are starting points for research, not final facts. Confirm each against the current label and cited papers before it goes on the site.

**Labelled indications (US label, verify current wording):** heart failure (reduced ejection fraction), hypertension, edema associated with hepatic cirrhosis or nephrotic syndrome, primary hyperaldosteronism.

**Off-label and borderline uses with typical evidence base**

| Use | Evidence level to assign | Evidence to cite |
| --- | --- | --- |
| Acne in adult women | A or B | SAFA randomised trial (UK), dermatology guidelines |
| Hirsutism and PCOS | B | Endocrine and PCOS guidelines |
| Female pattern hair loss | C | Observational studies |
| Heart failure with preserved ejection fraction | B | TOPCAT trial and guideline recommendation strength |
| Resistant hypertension add-on | A | PATHWAY-2 trial, hypertension guidelines |
| Gender-affirming feminising therapy | B | Endocrine Society guideline |
| Central serous chorioretinopathy | C | Small, mixed trials |
| Hidradenitis suppurativa | C | Case series |
| Premenstrual syndrome or PMDD | C | Small trials |
| Proteinuria in chronic kidney disease | B or C | Small trials, newer agents now preferred |

**ADR themes to quantify:** hyperkalaemia, hyponatraemia, gynaecomastia and breast tenderness, menstrual irregularity, erectile dysfunction and reduced libido, hypotension and dizziness, acute kidney injury, gastrointestinal upset, rash, and rare severe reactions such as blood dyscrasias and severe cutaneous reactions.

**Interaction themes:** ACE inhibitors, ARBs, potassium supplements, NSAIDs, trimethoprim, other potassium-sparing diuretics, digoxin, lithium.

## Appendix B. openFDA query cookbook

Base endpoint: `https://api.fda.gov/drug/event.json`

- Total reports: `search=patient.drug.openfda.generic_name:spironolactone&limit=1`
- Suspect-drug filter: add `+AND+patient.drug.drugcharacterization:1`
- Top reactions: `count=patient.reaction.reactionmeddrapt.exact`
- Reported indications: `count=patient.drug.drugindication.exact`
- Sex split: `count=patient.patientsex`
- Seriousness: `count=serious`
- Reports by year: `count=receivedate`
- Outcome flags: `count=seriousnessdeath` and similar serious\* fields

Count queries return at most the top 1000 terms. Record every query and date in METHODOLOGY.md.

## Appendix C. Reference list to cite

- Current Aldactone and Carospir prescribing information (DailyMed).
- UK SmPC for spironolactone (emc) and the relevant Indian label or CDSCO information.
- RALES: Pitt et al., New England Journal of Medicine, 1999.
- TOPCAT: Pitt et al., New England Journal of Medicine, 2014.
- PATHWAY-2: Williams et al., The Lancet, 2015.
- SAFA trial: Santer et al., 2023 (confirm journal and details).
- Endocrine Society and PCOS guidelines, and current heart failure, hypertension and acne guidelines.
- openFDA documentation, PubMed E-utilities, ClinicalTrials.gov API.

Disclaimer for the site: This project is for education only. It is not medical advice. Do not start, stop or change any medicine without a doctor or pharmacist.
