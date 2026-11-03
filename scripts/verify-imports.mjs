import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const modules = {
  'motion/react': 'motion',
  lenis: 'default',
  gsap: 'gsap',
  ogl: 'Renderer',
  recharts: 'BarChart',
  d3: 'scaleLinear',
  '@tanstack/react-table': 'useTable',
  clsx: 'clsx',
  'tailwind-merge': 'twMerge',
  'class-variance-authority': 'cva',
  'lucide-react': 'Activity',
};

for (const [name, symbol] of Object.entries(modules)) {
  const imported = await import(name);
  assert.ok(imported[symbol], `${name}: missing ${symbol}`);
  console.log(`Import OK: ${name}`);
}

// Fontsource packages export CSS; resolve them without loading fonts into the app.
for (const font of ['fraunces', 'inter', 'jetbrains-mono']) {
  assert.ok(require.resolve(`@fontsource/${font}/index.css`));
  console.log(`CSS entry OK: @fontsource/${font}`);
}
