/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0a0f2c', // Un azul muy oscuro espacial
        'space-accent': '#ffcc00', // El amarillo/dorado de acento
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'], // Usaremos una fuente sans-serif limpia y moderna
      },
    },
  },
  plugins: [],
}