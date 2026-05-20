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
          50: '#1a1714',
          100: '#292420',
          200: '#3d3733',
          300: '#57504a',
          400: '#6b6460',
          500: '#8c8580',
          600: '#b0aaa4',
          700: '#d4cfc8',
          800: '#edeae5',
          900: '#fafaf8',
        },
        gold: {
          300: '#fcd97b',
          400: '#f5c842',
          500: '#e8b422',
          600: '#c89a0f',
        },
        jade: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6800',
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
