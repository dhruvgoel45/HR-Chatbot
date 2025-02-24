/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif", "Rubik"],
        rubik: ["Rubik", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        Nunito: ["Nunito Sans", "sans-serif"],
      },
      fontSize: {
        "36px": "36px",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide","@tailwindcss/typography")],
};
