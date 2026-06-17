/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#050505',
        'cyber-accent': '#10b981',
        'cyber-text': '#EBEBEB',
      },
      fontFamily: {
        newsreader: ['Newsreader', 'serif'],
        inter: ['Inter', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'monospace'],
      },
    },
  },
  plugins: [],
}
