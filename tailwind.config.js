/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "src/**/*.{tsx, jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        backso: ['Backso', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

