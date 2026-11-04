# Vercel deployment

Production: [spironolactone-atlas.vercel.app](https://spironolactone-atlas.vercel.app/).

First deployment verified on 4 November 2026. Vercel project `spironolactone-atlas` belongs to `adarsh-gautam-sys-projects` and is connected to [the GitHub repository](https://github.com/adarsh-gautam-sys/Spironolactone-Atlas). The initial production deployment is `dpl_8KWKyq8BEC9fv2XdFKhW3exyPETC`; Vercel reported Ready, with the production alias assigned. The hosted opening is recorded in [the production screenshot](deployment/vercel-production.jpg).

## Build and updates

- Framework: Vite; Node.js 22.x, pinned in package.json.
- Install: `npm ci` from the committed lockfile.
- Build: `npm run build`, including data preparation and strict TypeScript checks.
- Static output: `dist/`; no server functions or runtime API credentials.
- The canonical URL and absolute Open Graph image URL use the production domain.
- GitHub pushes to the production branch are connected to Vercel. For a manual production update from this linked checkout, use `vercel deploy --prod --scope adarsh-gautam-sys-projects` after local checks.

The ignored `.vercel/` directory stores checkout-local project linkage. On a fresh checkout, authenticate with `vercel login`, then run `vercel link --project spironolactone-atlas --scope adarsh-gautam-sys-projects`. Never commit tokens or the pipeline environment file.

`.vercelignore` allows only the frontend, public exports, build scripts/configuration and the two frozen clean JSON inputs used by `prepare:data`. A pattern self-check confirmed 12 required paths are allowed and nine representative credential/cache/local paths are excluded. Raw response caches, Python environments and API keys are excluded. The openFDA key is not needed on Vercel.

## Verification

- Local build/typecheck, ESLint, formatting and all three frontend data tests passed.
- Vercel installed dependencies and completed its remote production build successfully.
- All 27 hosted JSON/CSV exports returned HTTP 200 and matched local SHA-256 hashes.
- Canonical/share metadata, the share image and favicon resolved on the production domain.
- The live browser rendered the atlas and loaded the frozen counts. No browser warnings/errors were captured during this check.
- The install audit reported 13 moderate advisories. A separate production-only audit reported zero vulnerabilities; development dependency remediation remains open. No automatic dependency changes were applied.

This deployment does not complete the remaining Phase 6 accessibility, screen-reader, zoom, cross-browser, Lighthouse, real-device and launch-asset work. No conformance or performance score is asserted. Runtime log monitoring and external share-card rendering were not audited in this deployment pass.
