/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#25f46a",
        "background-light": "#f5f8f6",
        "background-dark": "#102216",
        "primary-fixed": "#a5eeff",
        "on-background": "#dfe2eb",
        "surface-container-low": "#181c22",
        "surface-container-high": "#262a31",
        "surface-container-lowest": "#0a0e14",
        "secondary": "#ffb3b2",
        "tertiary": "#d6dcec",
        "tertiary-container": "#bbc0cf",
        "outline-variant": "#3c494e",
        "background": "#10141a",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}