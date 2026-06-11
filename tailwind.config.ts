import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: ["./src/**/*.tsx", "./src/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        // Uses CSS variables injected by next/font/google in layout.tsx
        sans: ["var(--font-inter)", "Inter", ...defaultTheme.fontFamily.sans],
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          ...defaultTheme.fontFamily.mono,
        ],
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
          muted: "#444444",
        },
        valora: {
          purple: "#7C3AED",
          "purple-light": "#A855F7",
          lavender: "#C4B5FD",
          urgent: "#EF4444",
          high: "#F59E0B",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      borderColor: {
        DEFAULT: "#222222",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        "valora-glow": "0 0 20px rgba(124, 58, 237, 0.15)",
        "valora-glow-strong": "0 0 40px rgba(124, 58, 237, 0.3)",
        "valora-inner": "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        surface: "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "valora-gradient":
          "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C4B5FD 100%)",
        "surface-gradient":
          "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-purple": "pulsePurple 2s infinite",
        shimmer: "shimmer 1.5s infinite",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
