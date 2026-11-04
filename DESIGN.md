---
name: Spironolactone Atlas
description: A warm editorial reading surface for evidence and its limits.
colors:
  background: '#f3eee6'
  surface: '#f3eee6'
  foreground: '#0b1020'
  muted: '#4b505b'
  accent: '#f38b73'
  accent-ink: '#9d4433'
  chart-teal: '#66b5ad'
  positive: '#276e67'
  positive-surface: '#e0e9e1'
  rule: '#626b7c'
  outline: '#727d8b'
  table-rule: '#3e4657'
typography:
  display:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 'clamp(64px, 7.5vw, 128px)'
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 'clamp(42px, 4.4vw, 68px)'
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: '-0.03em'
  title:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: '30px'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  body:
    fontFamily: 'Inter, Arial, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: 'JetBrains Mono, monospace'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: '4px'
  md: '6px'
spacing:
  compact: '12px'
  control: '20px'
  block: '28px'
  column: '45px'
  split: '70px'
components:
  button-primary:
    backgroundColor: '{colors.foreground}'
    textColor: '{colors.background}'
    rounded: '{rounded.md}'
    padding: '9px 40px'
  button-primary-hover:
    backgroundColor: '{colors.positive}'
    textColor: '{colors.background}'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    padding: '9px 40px'
  button-outline-hover:
    backgroundColor: '{colors.foreground}'
    textColor: '{colors.background}'
  field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.sm}'
    padding: '11px 35px 11px 13px'
  grade:
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    padding: '5px 8px'
  evidence-item:
    backgroundColor: 'transparent'
    textColor: '{colors.foreground}'
    padding: '26px 0 30px'
  segment-selected:
    backgroundColor: '{colors.foreground}'
    textColor: '{colors.background}'
    padding: '12px 20px'
---

# Design System: Spironolactone Atlas

## Overview

**Creative North Star: "Clinical Editorial"**

Warm paper, ink lettering and fine rules make the atlas feel like a carefully arranged reading document. Fraunces gives headings their editorial character; Inter carries explanations and controls; JetBrains Mono distinguishes quantities and compact classifications. The palette and form follow the user's original light mockup, which supersedes the earlier dark direction.

The interface alternates generous introductions with denser, inspectable evidence. Color supports a chart, a selected state or a legible explanation. Navigation and exploration remain visible through ordinary links, native disclosures, outlined controls and a paper-colored appraisal drawer. These rules describe `src/index.css`, the shipped UI/chart components and narrative sections. Product and source truth remain in `PRODUCT.md` and the analytical documentation; the introduction's particular composition remains in its surface brief.

**Key Characteristics:**

- Paper-colored surfaces and dark editorial type.
- Fine rules and restrained corners rather than floating panels.
- Coral and teal data marks with explicit text labels.
- Spacious headings beside explanatory copy, with compact provenance below data.
- Native controls, visible focus and static reduced-motion alternatives.

## Colors

The palette pairs warm neutral paper with ink, reserving brighter coral and teal for data and darker accent colors for readable foregrounds.

### Primary

- **Ink** (`foreground`): headings, prose, selected controls, primary action and strong dividing rules.
- **Coral** (`accent`): leading bar, completeness mark and receptor-state outline. It is a data color rather than the default small-text color.
- **Dark coral** (`accent-ink`): readable medicine-name emphasis during the mechanism sequence.

### Secondary

- **Chart teal** (`chart-teal`): secondary bars alongside coral.
- **Deep teal** (`positive`): focus outlines, active navigation underline, selected mechanism step, line plots, links and primary-action hover.
- **Pale teal paper** (`positive-surface`): the final mechanism handling-state background, retaining ink text and deep teal labels.

### Neutral

- **Warm paper** (`background`, `surface`): page and component grounds; the two semantic roles currently share a value.
- **Muted ink** (`muted`): explanatory text, source captions and secondary field text.
- **Rule**, **outline** and **table rule**: the recurring fine strokes separating sections, framing compact labels and organizing rows.

**The Legible Accent Rule.** Keep bright chart fills separate from text emphasis: the mechanism uses dark coral for its medicine label and deep teal for handling labels.

## Typography

**Display Font:** Fraunces, with Georgia and serif fallbacks. The installed display weight is semibold (600).

**Body Font:** Inter, with Arial and sans-serif fallbacks; regular (400) for reading and medium (500) for actions and field headings.

**Label/Mono Font:** JetBrains Mono, with monospace fallback, regular (400).

**Character:** Expressive serif headlines sit above practical sans-serif prose. Monospaced values help readers distinguish numerical and categorical information without giving the whole interface a technical texture.

### Hierarchy

- **Display:** the frontmatter's fluid title role; tight tracking and a broad desktop line. Below the mobile breakpoint it becomes `clamp(44px, 11vw, 74px)` with line height (1.04) and natural wrapping.
- **Headline:** section introductions use the fluid headline role; mobile section headings use (41px). Headings balance their line breaks.
- **Title:** the common third-level heading role. Chart headings are (28px), becoming (26px) on mobile; evidence titles are (30px), becoming (29px).
- **Body:** the frontmatter records the recurring dense explanation role. Section introductions are larger (21px / 1.65), becoming (17px / 1.7) on mobile. Explanatory measures commonly stop at (64–70ch).
- **Label:** compact grade badges use the monospaced label role; source notes use Inter (12px / 1.75), becoming (11px) on mobile. Numerical chart labels use monospaced tabular figures.

**The Three Voices Rule.** Use Fraunces for editorial headings, Inter for explanations and controls, and JetBrains Mono for values and compact classifications.

The introductory spaced uppercase line and four large statistic panels are specific to the user-selected original composition. Their treatment is not a general instruction to add eyebrows or statistic panels to later surfaces.

## Layout

The centered page container has a maximum width (1600px). Its side gutters are (52px), reducing to (32px) at widths up to (1100px), then (20px) up to (760px). The sticky header occupies the same container. Anchor offsets preserve reading access below it.

Section headings, the mechanism and methods use two equal columns, usually with a gap (70px). Paired charts use equal flexible columns and gaps (45px vertically, 60px horizontally). At tablet widths the major split gap reduces to (35px). Evidence entries form three columns, two on tablet, then one on mobile. At (760px) and below, reading splits and paired charts become a single column; filters wrap; wide tables scroll inside a focusable region.

The spacing entries describe recurring measured intervals rather than a universal mathematical scale. Narrative sections use padding (110px 0 30px), changing to (65px 0 10px) on mobile. Chart blocks use vertical padding (28px), changing to (24px). Dense components retain their own smaller intervals.

The opening page's centered introduction, paired actions, four outlined statistics and split commentary/chart are governed by `.impeccable/surfaces/src-app-tsx.md` and the original attachment. Statistics reflow to two columns on mobile. Preserve that approved composition without imposing it on every section.

## Elevation & Depth

The shipped system uses no box shadows. Paper-colored surfaces, fine strokes, spacing and selected ink fills establish structure. The sticky header stays opaque paper. The appraisal drawer is a fixed right-hand paper panel, bounded by a fine left rule; its modal backdrop is a dark translucent scrim (`rgb(2 5 12 / 0.78)`). The chapter menu is a bordered paper panel rather than a raised card.

**The Flat Paper Rule.** Separate content with spacing and rules; reserve the modal scrim for the appraisal dialog.

## Shapes

Controls use modest corners: the small radius serves fields and compact controls, and the medium radius serves actions, statistic panels and mechanism nodes. The grade badge has its own compact corner (3px). Desktop segmented controls join along shared strokes with rounded outer ends; mobile segments become individually rounded cells. Chart bars and completeness strips retain square ends. Thin rules are generally (1px); primary action outlines are (1.5px), and active navigation/step indicators are (2px).

## Components

### Buttons

Actions are clear, dark and restrained. Primary buttons use ink on paper inversely; secondary buttons use an ink outline on a transparent ground. Both use medium Inter (25px), a minimum height (64px), and the frontmatter padding. On mobile, standard buttons reduce to a minimum height (50px); the paired introductory actions use the narrower surface-specific spacing in the source. Small actions use (15px), a minimum height (48px) and padding (10px 22px).

Primary hover changes to deep teal; outline hover changes to ink with paper text. Color transitions last (0.2s). Focus throughout the interface uses a deep teal outline (2px) offset by (5px). Directional icons are stroked SVGs, never font glyph substitutes.

### Chips

Grade badges are small outlined monospaced classifications with padding from the frontmatter. A uses deep teal, B ink, and C muted ink. Each retains its visible grade text; the accompanying direction text is separate. These labels are descriptive, not interactive filter chips.

### Cards / Containers

Evidence entries are open reading blocks with a top rule, transparent background and no enclosing box or shadow. Their vertical layout places the grade/direction line before a serif title and muted explanation; the appraisal action sits at the bottom. Hover changes the title to deep teal; keyboard focus retains the global outline. The evidence drawer uses a width `min(620px, 100%)`, padding (32px 40px), and padding (22px) on mobile.

### Inputs / Fields

Selects and search inputs use paper, ink text, a thin gray stroke and the small radius. Minimum field height is (46px); labels sit above with a gap (9px). Search adds a muted stroked magnifier and left padding (40px); its desktop width (320px) becomes full width on mobile. Placeholder text uses muted ink; keyboard focus uses the shared visible outline. The shipped fields have no bespoke invalid or disabled visual variant.

### Navigation

The header is a sticky, paper-colored wordmark-and-links row with a fine bottom rule. The Fraunces wordmark uses tight tracking; desktop links are Inter with a deep teal bottom stroke for hover and the current location. At the mobile breakpoint the links give way to a native Chapters disclosure. Its links stack in a bordered paper panel and close after selection. Native anchor navigation is immediate.

### Segmented Controls

Adjacent outlined buttons use ink/paper inversion for the pressed state, with `aria-pressed` exposing that state. The stroke turns deep teal on hover. They wrap as needed on desktop and form a two-column grid of individually rounded controls on mobile. Preserve button semantics rather than styling these as navigation links.

### Charts and Source Notes

Bar rows align a text label, flat rectangular fill and monospaced number. Coral is first and teal follows; quantity is also explicit in text. Chart blocks begin with a rule, serif heading and muted takeaway, then end with a quiet source note and native View data disclosure. Data tables use fine row rules and paper-colored sticky headings inside a bounded scrolling region. Preserve these text and table companions when reusing a chart.

### Mechanism and Motion

The mechanism uses outlined nodes, a stroked directional arrow and numbered step buttons with bottom rules. Selected steps switch to ink text with a deep teal underline. Its state changes keep the medicine label ink/dark coral and the handling region paper/pale teal, so text remains legible through every step.

Motion is bounded: bar and mechanism state changes take (0.35s); the single introductory count takes (0.6s); the short introductory word reveal takes (0.4s) with a stagger (0.04s). Only the existing CountUp and BlurText adaptations supply React Bits effects. Reduced-motion mode shows complete content immediately and eliminates animated transitions. Do not hide essential prose or values behind scroll entrances.

## Do's and Don'ts

### Do:

- **Do** preserve warm paper, ink lettering, coral/teal data marks and fine rules from the user-selected original.
- **Do** apply the Three Voices Rule when adding headings, prose, values and controls.
- **Do** keep text labels, takeaways, source notes and underlying table access attached to chart patterns.
- **Do** retain visible keyboard focus, native disclosures and the mobile reading reflow.
- **Do** use the Legible Accent Rule across every mechanism state and reduced-motion alternative.

### Don't:

- **Don't** restore the superseded dark PRD direction.
- **Don't** replace open evidence entries with shadowed floating cards.
- **Don't** use bright coral or chart teal as the default color for small explanatory text.
- **Don't** generalize the introductory eyebrow or statistic-panel composition to every section.
- **Don't** add decorative motion that delays access to essential explanations or values.
