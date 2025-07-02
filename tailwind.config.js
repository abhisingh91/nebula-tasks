/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', "Roboto", "sans-serif"],
        roboto: ['Roboto', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
    'pulse-slow': 'pulse 6s ease-in-out infinite',
  },
    },
  },
  plugins: [],
}