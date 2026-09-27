/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        secondary: {
          DEFAULT: '#334155',
          dark: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(249, 115, 22, 0.25)',
        'soft-xl': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
