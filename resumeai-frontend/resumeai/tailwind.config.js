/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f4',
          100: '#e0e0e8',
          200: '#c1c1d1',
          300: '#9292ad',
          400: '#636389',
          500: '#3d3d63',
          600: '#2e2e4f',
          700: '#1f1f3b',
          800: '#131327',
          900: '#0a0a1a',
        },
        gold: {
          300: '#fcd97b',
          400: '#f5c842',
          500: '#e8b422',
          600: '#c89a0f',
        },
        jade: {
          400: '#4ade9a',
          500: '#22c76a',
          600: '#16a355',
        },
        rose: {
          400: '#f87171',
          500: '#ef4444',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
