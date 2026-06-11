import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: ["./src/**/*.tsx", "./src/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        background: "#0A0A0A",
        surface: "#111111",
        "surface-hover": "#1A1A1A",
        border: "#222222",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#A855F7",
          foreground: "#F8F8F8",
        },
        accent: "#C4B5FD",
        text: {
          primary: "#F8F8F8",
          secondary: "#888888",
        },
        valora: {
          purple: "#7C3AED",
          "purple-light": "#A855F7",
          lavender: "#C4B5FD",
          urgent: "#EF4444",
          high: "#F59E0B",
          success: "#22C55E",
        },
      },
      borderColor: {
        DEFAULT: "#222222",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-purple": "pulsePurple 2s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { transform: "translateX(20px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        pulsePurple: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(124, 58, 237, 0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
