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
        primary: "#0d59f2",
        secondary: "#2dd4bf",
        accent: "#f43f5e",
        "terminal-green": "#22c55e",
        "background-light": "#f5f6f8",
        "background-dark": "#101622",
        "stone-dark": "#1a1c23",
        "stone-light": "#282e39"
      },
      fontFamily: {
        display: "Montserrat",
        pixel: ["VT323", "monospace"]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px"
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)"
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glitch: "glitch 1s linear infinite",
        "matrix-flow": "matrix-flow 20s linear infinite"
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px #0d59f2" },
          "50%": { boxShadow: "0 0 15px #0d59f2, 0 0 5px #2dd4bf" }
        },
        glitch: {
          "2%, 64%": { transform: "translate(2px,0) skew(0deg)" },
          "4%, 60%": { transform: "translate(-2px,0) skew(0deg)" },
          "62%": { transform: "translate(0,0) skew(5deg)" }
        },
        "matrix-flow": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" }
        }
      }
    }
  },
  plugins: [],
}
