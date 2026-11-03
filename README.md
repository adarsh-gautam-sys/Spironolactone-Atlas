# Spironolactone Atlas

A planned data-driven, animated single-page educational study of spironolactone utilisation and pharmacovigilance. The page renders “Spironolactone Atlas — setup complete” with one Tailwind utility and a reduced-motion-aware Motion fade-in. See the phase roadmap for current progress.

See [project phases](docs/PHASES.md), [source and evidence review](docs/RESEARCH_FOUNDATION.md), [data protocol](docs/DATA_PROTOCOL.md), and [API check logs](data-pipeline/METHODOLOGY.md). Phase 1 records unresolved Indian-label and MedDRA mapping requirements; it is not a full evidence appraisal.

The [Phase 2 pipeline guide](data-pipeline/PIPELINE.md) explains extraction, cache/resume, counting, validation and publication commands. JSON/CSV exports are generated from reconciled source snapshots; evidence grades and unresolved label classifications are deferred to appraisal.

## Frontend setup

Use Node.js 22.12+ and npm (setup verified with Node 22.21.0).

```sh
npm ci
npm run dev
```

| Script                   | Purpose                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `npm run dev`            | Start Vite                                                                          |
| `npm run typecheck`      | Check application and Vite config in strict TypeScript                              |
| `npm run lint`           | Run ESLint with zero warnings allowed                                               |
| `npm run format`         | Format with Prettier and Tailwind class sorting                                     |
| `npm run format:check`   | Check formatting without edits                                                      |
| `npm run verify:imports` | Check installed library imports and font CSS entries without adding them to the app |
| `npm run build`          | Typecheck and generate production output in dist/                                   |
| `npm run preview`        | Serve the production build locally                                                  |

The `@/` alias resolves to `src/` in TypeScript and Vite. Tailwind v4 uses the official Vite plugin. Empty color, font and radius variables live in `src/index.css`; choose values during design. Fraunces, Inter and JetBrains Mono are installed but not loaded. Three.js and d3-sankey are deferred until needed.

## Python setup

Python 3.14 was used for setup. The environment is local and ignored by Git. From the project root on Windows PowerShell:

```powershell
python -m venv data-pipeline/.venv
& ./data-pipeline/.venv/Scripts/python.exe -m pip install -r data-pipeline/requirements.txt
Copy-Item data-pipeline/.env.example data-pipeline/.env
```

On macOS/Linux, use `python3 -m venv data-pipeline/.venv` and `data-pipeline/.venv/bin/python -m pip install -r data-pipeline/requirements.txt`. Copy the environment example only when creating a new local `.env`, preserving any existing credentials.

`OPENFDA_API_KEY` is optional. Future scripts must load `data-pipeline/.env` explicitly with python-dotenv. Raw responses stay in `data-pipeline/raw/` and are ignored; cleaned intermediate files belong in `data-pipeline/clean/`, final JSON/CSV exports in `public/data/`. Log every query and retrieval date in `data-pipeline/METHODOLOGY.md`.

## Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    ui/
    charts/
  sections/
  hooks/
  lib/
    utils.ts
  data/
    types.ts
public/data/
data-pipeline/
  raw/
  clean/
  scripts/
  .venv/                 (local, ignored)
  .env.example
  requirements.txt
  METHODOLOGY.md
docs/
  PRD.md
  REACTBITS.md
scripts/
  verify-imports.mjs
CLAUDE.md
components.json
```

The original supplied PRD is preserved at the repository root and copied unchanged to `docs/PRD.md`. It lists fields but no formal JSON schemas; `src/data/types.ts` is a provisional contract refined during source review. The Phase 1 review identifies corrections to seed assumptions without altering the original PRD.

See [React Bits commands](docs/REACTBITS.md) and [project conventions](CLAUDE.md). Phase 2 exports and their audit are complete; see [the results](docs/PHASE_2_RESULTS.md). Phase 3 analysis and bounded evidence appraisal are complete; see [the analysis](docs/PHASE_3_ANALYSIS.md). The next phase is design review. Design and frontend work remain separate later phases.

## Analysis reproduction

After restoring the documented raw caches and Python environment, run `data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/analyse.py`. It performs network-disabled record replay, verifies input export hashes and denominators, writes analysis JSON/CSV and renders analytical PNG/SVG figures. Matplotlib dependencies are pinned in `data-pipeline/requirements.txt`. The repository includes derived results and figures; raw caches remain local. See [content decisions](docs/CONTENT_DECISIONS.md) before using counts in website copy.
