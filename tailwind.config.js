/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce'
        },
        pinkish: {
          400: '#f472b6',
          500: '#ec4899'
        },
        ink: '#1f1a2e',
        muted: '#8b849c'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 30px rgba(120, 80, 200, 0.10)',
        card: '0 4px 20px rgba(120, 80, 200, 0.08)'
      },
      borderRadius: {
        '3xl': '1.75rem'
      }
    }
  },
  plugins: []
}
