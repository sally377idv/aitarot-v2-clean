/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ff',
          100: '#fcefff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        mystic: {
          100: '#f0f4f8',
          200: '#d9e2ec',
          300: '#bcccdc',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Merriweather', 'serif'],
      }
    },
  },
  plugins: [],
}