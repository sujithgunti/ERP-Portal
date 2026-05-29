import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: '#0e2a20',
          deep: '#0a1f17',
          800: '#11332680',
          700: '#15392b',
          600: '#1d4d39',
          moss: '#3f7d5e',
        },
        kraft: {
          DEFAULT: '#c8a26a',
          light: '#dcc193',
          dark: '#a07f4c',
        },
        paper: {
          DEFAULT: '#f6f2e9',
          deep: '#efe9da',
          card: '#fffdf8',
        },
        ink: {
          DEFAULT: '#16241d',
          soft: '#46544c',
          faint: '#8a958d',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,32,0.04), 0 12px 40px -12px rgba(16,42,32,0.18)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drift: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-3%,2%) scale(1.05)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 1.2s ease both',
        drift: 'drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
