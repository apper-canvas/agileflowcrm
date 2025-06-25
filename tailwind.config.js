/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5046E5',
        secondary: '#6B7280',
        accent: '#10B981',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '0.875rem',
        'lg': '1rem',
        'xl': '1.125rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '1.875rem',
        '5xl': '2.25rem'
      }
    },
  },
  plugins: [],
}