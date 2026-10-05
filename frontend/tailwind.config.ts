import type { Config } from 'tailwindcss';

// Colours point at CSS variables so the light and dark themes swap in one place (globals.css).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-2': 'var(--brand-2)',
        'brand-soft': 'var(--brand-soft)',
        'brand-ink': 'var(--brand-ink)',
        rust: 'var(--rust)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        serious: 'var(--serious)',
        bad: 'var(--bad)',
        info: 'var(--info)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        txt: 'var(--txt)',
        'txt-2': 'var(--txt-2)',
        'txt-3': 'var(--txt-3)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
      },
      fontFamily: {
        display: ['var(--display)'],
        body: ['var(--body)'],
        mono: ['var(--mono)'],
      },
    },
  },
  plugins: [],
};

export default config;
