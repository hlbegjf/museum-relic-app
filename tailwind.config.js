/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: "#F7F2E7",
        paperDeep: "#EFE6D4",
        ink: "#2B2B2B",
        inkSoft: "#5A5248",
        cinnabar: {
          DEFAULT: "#C8394B",
          deep: "#A02C3B",
        },
        azurite: "#2E5E8C",
        dai: "#1F3A5F",
        tungsten: "#E8A33D",
        gold: "#C9A063",
      },
      fontFamily: {
        display: ['"Ma Shan Zheng"', '"Kaiti SC"', '"STKaiti"', "cursive"],
        serif: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', "serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.9) rotate(-16deg)" },
          "60%": { opacity: "1", transform: "scale(0.94) rotate(-2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-4deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "drift": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-14px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "stamp-in": "stamp-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "glow-pulse": "glow-pulse 1.8s ease-in-out infinite",
        "spin-slow": "spin-slow 9s linear infinite",
        "drift": "drift 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
