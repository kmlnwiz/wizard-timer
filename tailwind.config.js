/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Zen Maru Gothic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
