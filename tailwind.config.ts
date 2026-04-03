import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          darkest: 'var(--color-primary-darkest)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
        },
        surface: {
          base: 'var(--surface-base)',
          panel: 'var(--surface-panel)',
          card: 'var(--surface-card)',
          hover: 'var(--surface-hover)',
        },
        txt: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          'on-primary': 'var(--text-on-primary)',
          link: 'var(--text-link)',
        },
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        story: {
          positive: 'var(--color-story-positive)',
          negative: 'var(--color-story-negative)',
          turning: 'var(--color-turning-point)',
        },
        border: 'var(--border-color)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
        screenplay: ['var(--font-screenplay)', 'Courier New', 'monospace'],
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
        '3': 'var(--shadow-3)',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '10px',
      },
    },
  },
  plugins: [],
};
export default config;
