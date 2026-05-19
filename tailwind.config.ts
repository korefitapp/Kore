import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kore: {
          bg: "rgb(var(--kore-bg) / <alpha-value>)",
          card: "rgb(var(--kore-card) / <alpha-value>)",
          ink: "rgb(var(--kore-ink) / <alpha-value>)",
          subink: "rgb(var(--kore-subink) / <alpha-value>)",
          muted: "rgb(var(--kore-muted) / <alpha-value>)",
          border: "rgb(var(--kore-border) / <alpha-value>)",
          emerald: "rgb(var(--kore-emerald) / <alpha-value>)",
          "emerald-deep": "rgb(var(--kore-emerald-deep) / <alpha-value>)",
          "emerald-soft": "rgb(var(--kore-emerald-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "kore-soft":
          "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px rgb(15 23 42 / 0.04)",
        "kore-emerald": "0 8px 24px rgb(16 185 129 / 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
