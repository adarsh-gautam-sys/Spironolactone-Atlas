# Spironolactone Atlas

An animated, single-page educational atlas of spironolactone uses, research evidence and adverse-event reporting. It includes a guided narrative, product-label comparisons, ten evidence appraisals, reporting and trial charts, subgroup filters, a searchable interaction reference and downloadable source data.

The user's original light mockup governs the visual design: warm paper, ink typography and coral/teal charts. See [frontend delivery](docs/PHASE_5_FRONTEND.md), [the design system](DESIGN.md), [project phases](docs/PHASES.md) and [content decisions](docs/CONTENT_DECISIONS.md). Quality audits and deployment remain Phase 6.

## Frontend setup

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

- `npm run dev`: Vite development server.
- `npm run prepare:data`: derive the compact frontend overview and appraisal copy from frozen exports.
- `npm test`: verify subgroup filters, counts, denominators and source reconciliation.
- `npm run typecheck`: strict TypeScript checks for the app and Vite config.
- `npm run lint`: ESLint with zero warnings allowed.
- `npm run format` / `npm run format:check`: Prettier with Tailwind class sorting.
- `npm run verify:imports`: check installed library and font imports.
- `npm run build`: prepare data, typecheck and produce `dist/`.
- `npm run preview`: serve the production build locally.

The `@/` alias resolves to `src/` in TypeScript and Vite. Tailwind v4 uses its official Vite plugin. Shared tokens live in `src/index.css`. Fraunces, Inter and JetBrains Mono are self-hosted through Fontsource. Motion imports use `motion/react`; two adapted React Bits effects honour reduced motion. Three.js and d3-sankey remain deferred; Lenis and WebGL effects are not activated.

## Structure

```text
src/
  App.tsx                 introduction and opening chart
  index.css               tokens, responsive styles, reduced motion
  components/charts/      bars, D3 line plot, source/table wrappers
  components/ui/          navigation, selected effects, source notes
  sections/               medicine, evidence, reporting, research, methods
  hooks/                  abortable static JSON loading
  lib/                    formatting, report filters, utilities
  data/                   TypeScript data contracts
public/
  data/                   frozen JSON/CSV and derived frontend overview
  favicon.svg
  og-image.jpg
scripts/                  data preparation and frontend verification
data-pipeline/
  raw/                    local ignored source caches
  clean/                  analysis and appraisal results
  scripts/                extraction, analysis and validation
  .venv/                  local ignored Python environment
  .env.example
  requirements.txt
  METHODOLOGY.md
docs/                     PRD, evidence, methodology and delivery records
.impeccable/              approved references, review evidence, design sidecar
DESIGN.md
PRODUCT.md
CLAUDE.md
```

## Data and Python setup

The browser reads public static exports only. API keys stay in the ignored pipeline environment file. From Windows PowerShell:

```powershell
python -m venv data-pipeline/.venv
& ./data-pipeline/.venv/Scripts/python.exe -m pip install -r data-pipeline/requirements.txt
Copy-Item data-pipeline/.env.example data-pipeline/.env
```

Copy the example only when creating a new `.env`, preserving existing credentials. On macOS/Linux use `python3 -m venv` and the environment's `bin/python`. The optional `OPENFDA_API_KEY` is loaded by pipeline scripts. Raw caches remain local and ignored.

See [pipeline reproduction](data-pipeline/PIPELINE.md), [source review](docs/RESEARCH_FOUNDATION.md), [Phase 2 results](docs/PHASE_2_RESULTS.md), [analysis](docs/PHASE_3_ANALYSIS.md), [appraisal](docs/EVIDENCE_APPRAISAL.md) and [query logs](data-pipeline/METHODOLOGY.md). Run `data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/analyse.py` after restoring documented source caches to replay analysis offline. The repository includes derived results and figures. The original PRD is retained unchanged; content corrections and the user's later visual choice supersede its unsupported proposals.

See [React Bits commands and license](docs/REACTBITS.md) and [project conventions](CLAUDE.md). Reporting is not incidence or causality. India-specific approval and licensed MedDRA hierarchy gaps remain explicit.
