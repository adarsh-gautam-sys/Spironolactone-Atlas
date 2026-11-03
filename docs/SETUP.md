# Setup verification

Verified 3 November 2026. Setup only; the browser shows the requested single-line placeholder.

## Checks

- Typecheck, ESLint, Prettier, production build and library import checks passed.
- Python imports and pip dependency check passed.
- Vite started on 127.0.0.1:5173; HTTP 200 and browser rendering confirmed.
- Production CSS contains the p-4 utility; source imports use the @/ alias.
- All twelve React Bits registry endpoints resolved; no components installed.
- Original PRD preserved and copied unchanged to docs/PRD.md.

## Decisions and limitations

- Selected Fraunces, Inter and JetBrains Mono; installed without loading fonts.
- Deferred Three.js and d3-sankey until a component/chart needs them.
- PRD supplies fields, not formal JSON schemas; data types are provisional.
- TanStack Table 9 exports useTable; the import check uses that API.
- ESLint 9 was reported unsupported during installation; upgraded to supported ESLint 10 with compatible plugins.
- Sandbox DNS/socket failures were resolved by running downloads and local-server verification with network access.
- npm audit reports 13 moderate development-tool findings, all connected to minimatch GHSA-g3hv-75wg-m249. Production audit reports zero findings. Suggested automatic fixes include breaking downgrades; no forced downgrade or major transitive override applied. Recheck upstream lint-tool fixes before CI handles untrusted glob patterns.
- No data extraction, medical-source verification, design, component implementation or deployment performed.

## Installed versions

Runtime: Node.js 22.21.0, npm 10.9.4, Python 3.14.0. Exact npm resolutions are locked in package-lock.json.

| Package                     | Version | Scope       |
| --------------------------- | ------- | ----------- |
| @fontsource/fraunces        | 5.3.0   | Runtime     |
| @fontsource/inter           | 5.3.0   | Runtime     |
| @fontsource/jetbrains-mono  | 5.3.0   | Runtime     |
| @tanstack/react-table       | 9.3.1   | Runtime     |
| class-variance-authority    | 0.7.1   | Runtime     |
| clsx                        | 2.1.1   | Runtime     |
| d3                          | 7.9.1   | Runtime     |
| gsap                        | 3.15.0  | Runtime     |
| lenis                       | 1.3.27  | Runtime     |
| lucide-react                | 1.67.0  | Runtime     |
| motion                      | 14.9.0  | Runtime     |
| ogl                         | 1.0.11  | Runtime     |
| react                       | 19.3.1  | Runtime     |
| react-dom                   | 19.3.1  | Runtime     |
| recharts                    | 3.10.1  | Runtime     |
| tailwind-merge              | 3.7.0   | Runtime     |
| @eslint/js                  | 10.0.1  | Development |
| @tailwindcss/vite           | 4.3.4   | Development |
| @types/d3                   | 7.4.3   | Development |
| @types/node                 | 26.6.6  | Development |
| @types/react                | 19.3.0  | Development |
| @types/react-dom            | 19.3.0  | Development |
| @vitejs/plugin-react        | 6.2.1   | Development |
| eslint                      | 10.14.0 | Development |
| eslint-config-prettier      | 10.1.8  | Development |
| eslint-plugin-react-hooks   | 7.1.1   | Development |
| eslint-plugin-react-refresh | 0.5.7   | Development |
| globals                     | 17.14.0 | Development |
| prettier                    | 3.9.10  | Development |
| prettier-plugin-tailwindcss | 0.8.1   | Development |
| tailwindcss                 | 4.3.4   | Development |
| typescript                  | 6.0.3   | Development |
| typescript-eslint           | 8.72.1  | Development |
| vite                        | 8.3.5   | Development |

Python environment pins (including transitive dependencies):

```text
certifi==2026.10.23
charset-normalizer==3.5.2
idna==3.20
numpy==2.5.4
pandas==3.1.0
python-dateutil==4.0.0
python-dotenv==1.2.4
requests==2.34.2
tzdata==2026.6
urllib3==2.8.0
```
