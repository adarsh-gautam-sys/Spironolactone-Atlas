# React Bits installation reference

Verified on 3 November 2026 against the [official installation guide](https://reactbits.dev/get-started/installation) and [registry documentation](https://github.com/davidhdev/react-bits/blob/main/README.md).

The current documented CLI method uses shadcn. `components.json` is configured manually so initialization does not add UI, fonts or theme styles. It registers `@react-bits` as `https://reactbits.dev/r/{name}.json`, enables TypeScript and points component aliases to `src/components/ui`. Tailwind v4 uses an empty config path and `src/index.css`. The shadcn `new-york` / `neutral` metadata is CLI configuration only; no corresponding theme is applied.

Run individual commands from the project root when a component is selected. `TS-TW` means TypeScript plus Tailwind. These commands copy source files and may add dependencies; review the diff and bundle impact. Phase 5 includes two adapted components, CountUp and BlurText, in `src/components/ui/`. Do not overwrite those accessible project adaptations without reviewing the diff.

```sh
npx shadcn@latest add @react-bits/Aurora-TS-TW
npx shadcn@latest add @react-bits/Particles-TS-TW
npx shadcn@latest add @react-bits/SplitText-TS-TW
npx shadcn@latest add @react-bits/BlurText-TS-TW
npx shadcn@latest add @react-bits/ShinyText-TS-TW
npx shadcn@latest add @react-bits/CountUp-TS-TW
npx shadcn@latest add @react-bits/ScrollReveal-TS-TW
npx shadcn@latest add @react-bits/SpotlightCard-TS-TW
npx shadcn@latest add @react-bits/MagicBento-TS-TW
npx shadcn@latest add @react-bits/Stack-TS-TW
npx shadcn@latest add @react-bits/Dock-TS-TW
npx shadcn@latest add @react-bits/ScrollVelocity-TS-TW
```

This is a menu, not an instruction to install all twelve. The PRD caps the final site at six React Bits components. GSAP and OGL are available; install Three.js only if a selected component requires it. Every effect must honour reduced motion.

The two installed adaptations use the official registry sources, retain Motion 14, and add no dependencies. CountUp animates one introductory report count; BlurText animates the short introductory eyebrow. Both show complete static content for reduced motion. The upstream MIT + Commons Clause license is retained at `src/components/ui/REACT_BITS_LICENSE.txt`; review it before redistribution or commercial reuse. Other effects and Lenis are not activated.

All twelve registry JSON endpoints were fetched successfully during setup. Some entries currently declare `motion@^12.23.12`, while this scaffold uses Motion 14. Review proposed package changes before accepting a later install; do not silently downgrade the scaffold. SplitText also requests `@gsap/react`; MagicBento currently requests Hugeicons packages. These component-specific dependencies are deferred until selection.
