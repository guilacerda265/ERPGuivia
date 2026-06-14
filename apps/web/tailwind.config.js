/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#7c3aed', dark: '#6d28d9', light: '#f5f3ff' },
        ink: '#0b0b0f',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,16,20,.04), 0 8px 24px -12px rgba(16,16,20,.12)',
      },
    },
  },
  plugins: [],
};
