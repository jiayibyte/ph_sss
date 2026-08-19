/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      colors: {
        // All accent colors resolve to CSS variables set from site.config.ts.
        // Components must use these tokens — never hardcoded hex values.
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        'accent-soft': 'var(--accent-soft)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        line: 'var(--line)',
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
      },
      fontFamily: {
        // System font stack — zero font downloads by design (weak-network budget)
        sans: [
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '46rem',
        wide: '64rem',
      },
    },
  },
  plugins: [],
};
