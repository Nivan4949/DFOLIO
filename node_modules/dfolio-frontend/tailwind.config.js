/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arch: {
          bg: '#FAF8F5',
          surface: '#FFFFFF',
          border: '#E8E5DF',
          text: '#16171A',
          muted: '#6E7179',
          darkBg: '#121316',
          darkSurface: '#1C1D23',
          darkBorder: '#2B2D34',
          accent: '#2C2B29',
          gold: '#C5A880',
        },
        brand: {
          50: '#FAF8F5',
          100: '#F4F1EA',
          200: '#E8E4D8',
          300: '#D5CFBE',
          400: '#B8AF98',
          500: '#1C1D21',
          600: '#16171A',
          700: '#101113',
          800: '#0B0B0D',
          900: '#050506',
          950: '#020203',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        arch: '0 4px 20px -2px rgba(22, 23, 26, 0.05)',
        'arch-hover': '0 12px 30px -4px rgba(22, 23, 26, 0.08)',
        'arch-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
