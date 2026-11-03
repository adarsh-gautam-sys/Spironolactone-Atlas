# Project conventions

- Follow `docs/PHASES.md`. Phase 3 analysis work is authorized; design and frontend implementation require a later instruction.
- Use npm, Vite, React and TypeScript strict mode. Import project files through `@/` where useful.
- Use Tailwind CSS v4 through its Vite plugin. Keep design-token placeholders in `src/index.css`; do not choose values during setup.
- Import Motion from `motion/react`, never `framer-motion`.
- Honour `prefers-reduced-motion` for every animation, including smooth scrolling and React Bits effects. Supply a static fallback.
- Use at most 6 React Bits components across the finished site. Review dependencies and bundle cost before adding each. Lazy-load heavy effects.
- Every chart needs a named source and retrieval-date footnote, a text takeaway and an underlying data-table view.
- Never hardcode medical facts without a source. PRD seed content is unverified research input.
- FAERS counts are reports, not incidence or proof of causality. Document queries, filters, mapping decisions and limitations.
- Keep API keys in local environment files. The browser reads only public static exports from `public/data/`.
- Use `data-pipeline/.venv` for Python; log extraction in `data-pipeline/METHODOLOGY.md`.
- Run `npm run typecheck`, `npm run lint`, `npm run format:check` and `npm run build` before committing changes.

- After each major completed update, commit and push to https://github.com/adarsh-gautam-sys/Spironolactone-Atlas. Preserve existing remote history and never include environment files, API keys or raw response caches.
