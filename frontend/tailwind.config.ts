import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: {
          DEFAULT: '#111111',
          elevated: '#191919',
        },
        foreground: '#F1F1EE',
        secondary: '#A1A1AA',
        muted: '#71717A',
        // border shorthands via colors (text-line, bg-line, border-line all work)
        line: 'rgba(255,255,255,0.08)',
        strong: 'rgba(255,255,255,0.14)',
        accent: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          dim: 'rgba(139,92,246,0.12)',
          border: 'rgba(139,92,246,0.3)',
        },
        fake: {
          DEFAULT: '#EF4444',
          dim: 'rgba(239,68,68,0.1)',
          border: 'rgba(239,68,68,0.25)',
        },
        real: {
          DEFAULT: '#22C55E',
          dim: 'rgba(34,197,94,0.1)',
          border: 'rgba(34,197,94,0.25)',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
        strong: 'rgba(255,255,255,0.14)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}

export default config
