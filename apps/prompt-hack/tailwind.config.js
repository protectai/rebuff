/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "expand-height": "expandHeight 1s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", display: "none" },
          "1%": { opacity: "0", display: "block" },
          "100%": { opacity: "1", display: "block" },
        },
        expandHeight: {
          "0%": { height: "0", overflow: "hidden" },
          "100%": { height: "auto", overflow: "hidden" },
        },
      },
    },
  },
  variants: {},
  plugins: [],
};
