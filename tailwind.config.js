/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 16px 40px rgba(36, 80, 45, 0.10)' },
      colors: { guard: { 50: '#F3FAF3', 100: '#E0F1E1', 200: '#C1E2C3', 500: '#4CAF50', 700: '#2E7D32', 900: '#0F1A12' } },
    },
  },
  plugins: [],
}
