# Typeset review and verification

Target: `src/App.tsx` and its shared styles/charts. The independent source/visual assessment was `/root/typeset_assessment_a`; the isolated initial type scan was `/root/typeset_scan_b`. The design assessment finished before scanner findings entered synthesis. Neither agent changed source. Parent performed the live browser checks.

## Seven assessment questions

1. **Authority and fit.** The user-original composition and DESIGN.md establish Fraunces 600, Inter 400/500 and JetBrains Mono 400. Headings, reading and quantities/code retain distinct jobs. The pass adds no family or asset; original hero/header typography is preserved at 360 px and above.
2. **Hierarchy.** The original display/section/entry hierarchy remains. Ordinary explanations now share `--text-body: 1rem` and `--leading-body: 1.7`; live chart, evidence, method and short-read paragraphs compute to 16 px / 27.2 px. Sources remain 12 px, qualifiers 15 px medium, and dense numeric tables 13 px Mono. Longer clinical explanations gain readable size without promoting metadata to body prominence.
3. **Scale and consistency.** Repeated explanations formerly at 14–16 px now use one reading role, including mobile chart takeaways and the short read. Fraunces 600 is explicit on the wordmark, evidence titles and medicine node. Compact and responsive variants are documented by role rather than flattened onto one size.
4. **Reading and rhythm.** Wide prose uses a 68ch cap; constrained columns reflow naturally. Source-gap, grade-key and subsection prose formerly allowed 78–85ch. No first-line indentation is added. Numeric table values are lining/tabular Mono and right-aligned; category labels and narrative interaction cells remain left-aligned.
5. **Stress.** Production checks at 320, 360, 640, 1280 and 1920 px found no horizontal body overflow, title/header clipping or SVG tick text outside horizontal plot bounds. The below-360 px adjustment preserves whole names and year values. SVG text is 12 px with a container-matched viewBox, including 265 px wide plots at the 320 px viewport. Full browser zoom, localization expansion and screen-reader checks are not claimed.
6. **Delivery.** The four local Fontsource CSS rules use `font-display: swap` with Georgia/Arial/monospace fallbacks. No synthetic weight or extra font download is introduced. Metric-adjusted fallbacks or preload changes are deferred because no loading evidence justified them. Browser resource timing and iterable FontFaceSet inspection were unavailable; actual font requests and font-swap CLS were not measured.
7. **Assets.** Source imports remain Latin Fraunces 600, Inter 400 and 500, and JetBrains Mono 400. WOFF2 plus WOFF fallback sources in each rule do not imply that both formats download. No unused italic or variable-font axis is added. Dense code, data, sources and original introductory type remain explicit exceptions to the ordinary reading role.

## Mechanical scan

The initial type-only source scan reported 98 `design-system-font-size` advisories. The final scan reports 63, with exit 2 and no execution error. Remaining advisories preserve the original composition, existing heading/lead/control/diagram roles, compact query/bar metadata, or the documented below-360 px adaptation. Each location and decision is stored in `b-type-after.json`; raw outputs are retained without formatting. The reduction is not a usability score: resolved CSS variables and font shorthand require rendered inspection.

No detector waiver or ignored source path was added. Raw-output files are excluded only from Prettier, preserving exact scan evidence. The prior critique's 29/40 heuristic score has not been re-scored.

## Live evidence

Screenshots in this directory show the 320 px opening, reading/appraisal flow, mobile chart and right-aligned source table. DOM checks confirmed 16 px explanations, 12 px SVG ticks, tabular right-aligned data values, left-aligned narrative cells and no captured console errors. Source data and medical wording are unchanged. Build/typecheck, ESLint, formatting and existing data tests provide separate verification; the type advisory scan remains non-zero as recorded above.
