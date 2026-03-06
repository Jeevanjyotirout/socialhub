/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef0ff', 100: '#e0e3ff', 200: '#c7cbfe',
          300: '#a5aafc', 400: '#8287f8', 500: '#5865f9',
          600: '#4149e8', 700: '#3840d0', 800: '#3036a8',
          900: '#2d3285', 950: '#1c1f52',
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease-out both',
        'fade-in':   'fadeIn 0.3s ease-out both',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-sm':  'pulse 2s ease-in-out infinite',
        'shimmer':   'shimmer 1.5s linear infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer:  { '0%,100%': { backgroundPosition: '200% 0' }, '50%': { backgroundPosition: '-200% 0' } },
      },
      boxShadow: {
        'brand':    '0 0 24px rgba(88,101,249,0.35)',
        'brand-sm': '0 0 12px rgba(88,101,249,0.25)',
        'glass':    '0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
