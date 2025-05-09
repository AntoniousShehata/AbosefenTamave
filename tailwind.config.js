/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A0DAD',
        secondary: '#D10024',
        light: '#f9f9f9',
        dark: '#1f1f1f',
      },
    },
  },
  plugins: [],
}
