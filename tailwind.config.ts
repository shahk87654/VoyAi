import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      colors: {
        navy: {
          50:  '#f8fafc', 100: '#e2e8f0', 200: '#cbd5e1', 300: '#94a3b8',
          400: '#64748b', 500: '#475569', 600: '#334155', 700: '#1e293b',
          800: '#0f172a', 900: '#0a0f1e', 950: '#030712',
        },
        amber: {
          50:  '#fffbeb', 100: '#fef3c7', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706',
        },
        emerald: {
          50:  '#f0fdf4', 100: '#dcfce7', 500: '#10b981', 600: '#059669',
        },
        rose: {
          50:  '#fff7ed', 100: '#ffe4e6', 500: '#f43f5e', 600: '#e11d48',
        },
        sky: {
          100: '#e0f2fe', 500: '#0ea5e9',
        },
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '16px', xl: '24px', '2xl': '32px',
      },
      boxShadow: {
        glow: '0 0 0 3px #fcd34d',
        'glow-sm': '0 0 0 2px #fcd34d',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.4s ease both',
        'slide-in':   'slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
        'typing':     'typing 1.2s steps(3) infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        shimmer:   { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        typing:    { '0%': { content: '.' }, '33%': { content: '..' }, '66%': { content: '...' } },
      },
    },
  },
  plugins: [],
}

export default config
