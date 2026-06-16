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
        serif: ['Newsreader', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
    },
  },
  plugins: [],
}
