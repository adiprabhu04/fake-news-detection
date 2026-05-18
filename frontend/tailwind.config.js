/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          DEFAULT: '#0a0a0a',
          elevated: '#111111',
          card: '#161616',
          hover: '#1c1c1c',
        },
        // Semantic text colors (accessible via text-primary, text-secondary, etc.)
        primary: '#f4f4f5',
        secondary: '#a1a1aa',
        dim: '#52525b',
        muted: '#3f3f46',
        // Accent (indigo)
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          dim: 'rgba(99,102,241,0.12)',
          border: 'rgba(99,102,241,0.25)',
        },
        // Verdict colors
        fake: {
          DEFAULT: '#ef4444',
          dim: 'rgba(239,68,68,0.1)',
          border: 'rgba(239,68,68,0.25)',
        },
        real: {
          DEFAULT: '#22c55e',
          dim: 'rgba(34,197,94,0.1)',
          border: 'rgba(34,197,94,0.25)',
        },
        // Border shorthands (used via border-line, border-strong)
        line: 'rgba(255,255,255,0.07)',
        strong: 'rgba(255,255,255,0.12)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
        strong: 'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
        'slide-up': 'slideUp 0.3s ease-out both',
        'scale-in': 'scaleIn 0.2s ease-out both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
