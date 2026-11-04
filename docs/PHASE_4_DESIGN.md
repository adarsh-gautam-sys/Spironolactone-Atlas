# Phase 4 — approved design handoff

> Historical handoff. On 4 November 2026 the user explicitly selected the original light attachment at `.impeccable/mocks/composition/02-user-original.png`, overriding the dark palette below and the PRD's visual direction. The current implementation and system are recorded in `PHASE_5_FRONTEND.md` and root `DESIGN.md`.

The shape brief and **Clinical Editorial** composition are approved. The composition-board answer selected `clinical-editorial`, with no revision note and the comp-first workflow retained. This completes the planning phase. Phase 5 frontend implementation has not started.

Approved image: `../.impeccable/mocks/composition/01-clinical-editorial.png`, 1487 × 1058. Its PNG is byte-identical to the previously selected decision image; it was not regenerated. Its JSON sidecar records approval. Options 2 and 3 remain unapproved alternatives.

## Layout and component inventory

- **Header:** semantic navigation on a continuous ink ground, wordmark on the left, five text destinations on the right, one fine rule below. Use Lucide for the external-link arrow if needed. The active item follows the visible section; the mockup's Reporting data underline is illustrative.
- **Introduction:** centered serif product heading is the strongest text in the viewport. A small mono eyebrow, two-line readable introduction and adjacent primary/secondary anchors establish the reading route. The primary anchor is coral with ink text and a right arrow; the secondary is transparent with an off-white outline. Build both with semantic HTML/CSS and accessible focus states.
- **Headline figures:** four equal panels, modest corners, fine off-white borders and quiet ink surfaces. Values are large, monospaced/tabular and positioned above their labels. Source, retrieval date and cohort count sit immediately below the row. Bind values to the validated data, not independent hardcoded clinical claims.
- **First reporting section:** a serif question and explanatory sentence occupy the left third; a horizontal reaction-term chart occupies the right two thirds. Use semantic text plus SVG or a chart library, with readable labels, a denominator, source/date and an underlying table control. No raster chart in the website.
- **Chart commitments:** Hyperkalaemia 3,452; Acute kidney injury 3,133; Hypotension 1,832. Use exact data proportions in code, correcting the generated image's approximate bar lengths. The leading bar is coral and the other bars are quieter coral. These counts do not establish incidence or causality. The source-note font may grow from the mockup where required for readability.
- **Material and type:** dark uninterrupted ground, warm off-white lettering, fine rules, modest rounded rectangles, no large shadows or glass. The title is approximately twice the lower section-heading scale, and numeric values sit between those levels. Match the approved image at 1487 × 1058 before extending the page; the image is authority over these approximate measurements.
- **Later content:** use the same serif section headings, body typography, source notes and restrained controls for medicine context, uses/evidence, reporting exploration, research activity, interactions and methods. Evidence details retain their question, population, endpoint direction and source scope. Long lists use bounded summaries with accessible tables.

## Token and typography plan

These are implementation targets, not values applied to the placeholder stylesheet:

- Background: deep ink `#0B1020`; text: off-white `#F3F0E8`; primary emphasis: coral `#F48F7A`; navigation/evidence accent: teal `#65B8AC`. Reserve amber/red for meaningful warnings. Match the comp's rendered surfaces during reproduction rather than introducing unrelated shades.
- Display: Fraunces, following the approved direction; body: Inter; figures and annotations: JetBrains Mono with tabular numerals. Keep the display face out of long body paragraphs.
- Corners: modest, approximately 6 px for buttons and figure panels at the reference viewport. Rules and outlines are fine, approximately 1 px. Avoid a second container or elevation system.
- Responsive type and spacing must preserve the comp's scale relationships while supporting 360–1920 px. Body text and source notes remain readable without zoom; do not shrink labels to preserve the desktop arrangement.

## Responsive and motion handoff

- On desktop, reproduce the approved opening arrangement. On narrow screens, replace the horizontal header links with a labelled chapter control, stack the introductory actions as needed, reflow statistics into two columns or one when labels require it, and place chart commentary before its chart. Keep source notes beside the material they qualify.
- Use native section anchors and semantic headings. Filters, evidence disclosures and tables need keyboard access, visible focus, touch targets and useful loading/error/empty states.
- Use `motion/react` for short coordinated entrances and stable chart/filter transitions. One CountUp instance may animate the selected cohort figure; expose its final value to assistive technology. BlurText may animate the short introductory eyebrow. The main title and essential evidence remain available immediately.
- No Dock, SpotlightCard, Aurora or other React Bits component is required by this approved composition. Two selected components remain below the ceiling of six. Review registry and Motion compatibility before installing them in Phase 5. Lenis is optional and must preserve navigation, focus and reduced-motion behavior.
- Reduced motion displays final figures, complete charts and all text immediately. No scroll hijacking, flashing, infinite ambient motion or animation gate on data/source access.

## Implementation boundary and verification

The source App and stylesheet remain unchanged. No `DESIGN.md` is written before the build; it will be derived from the finished implementation. Phase 5 starts by recording the direction contract, reproducing the approved first viewport and saving its comparison capture, then extends the page and adds interaction/responsiveness. The Impeccable finish review and documentation follow implementation.

The existing pipeline, source gaps and content corrections remain binding. Typecheck, lint, formatting and build passed for the planning packet; PNG provenance was verified. These checks do not validate the future frontend's accessibility or performance.
