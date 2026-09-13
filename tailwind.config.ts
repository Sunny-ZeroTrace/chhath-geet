import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunrise: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f2751a",
          600: "#e05a0e",
          700: "#b8440c",
          800: "#933611",
          900: "#782e12",
        },
        gold: {
          300: "#f3d47a",
          400: "#e9bf4f",
          500: "#d8a531",
          600: "#b4841f",
        },
        river: {
          400: "#5b8ca6",
          500: "#3d6e88",
          600: "#2c5670",
        },
        cream: "#fdf6ec",
        ghat: {
          900: "#231710",
          800: "#33231a",
          700: "#402c20",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        devanagari: ["var(--font-devanagari)", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "flicker": "flicker 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
