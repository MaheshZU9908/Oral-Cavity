/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        clinical: {
          slate: '#0f172a',
          card: '#ffffff',
          border: '#e2e8f0',
          muted: '#64748b',
          surface: '#f8fafc',
        },
        risk: {
          low: '#059669',
          'low-bg': '#ecfdf5',
          'low-border': '#a7f3d0',
          moderate: '#d97706',
          'moderate-bg': '#fffbeb',
          'moderate-border': '#fde68a',
          high: '#e11d48',
          'high-bg': '#fff1f2',
          'high-border': '#fecdd3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
