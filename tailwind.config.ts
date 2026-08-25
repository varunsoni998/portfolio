import type { Config } from "tailwindcss";

// Design tokens live as HSL CSS custom properties in src/index.css
// (:root). Every color utility here reads from one of those variables —
// nothing is hardcoded, so the whole palette can be retuned in one file.
// See README.md "Design system" for the rationale.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-2": "hsl(var(--surface-2) / <alpha-value>)",
        text: "hsl(var(--text) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-2": "hsl(var(--muted-2) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        "border-2": "hsl(var(--border-2) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        amber: "hsl(var(--amber) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 5.6vw, 4.75rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.1rem, 4vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.5rem, 2.4vw, 2.1rem)", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        content: "76rem",
      },
      borderRadius: {
        surface: "1.75rem",
      },
      boxShadow: {
        surface: "0 30px 80px -40px hsl(var(--text) / 0.25)",
      },
      transitionTimingFunction: {
        system: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        morph: {
          "0%, 100%": { borderRadius: "42% 58% 65% 35% / 45% 45% 55% 55%" },
          "34%": { borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%" },
          "67%": { borderRadius: "35% 65% 55% 45% / 60% 35% 65% 40%" },
        },
        drift: {
          "0%, 100%": { transform: "translate(-50%, -22%) scale(1)" },
          "50%": { transform: "translate(-46%, -16%) scale(1.08)" },
        },
        "core-drift": {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-46%, -54%) scale(1.12)" },
        },
        "orbit-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-node": "pulse-node 2.6s ease-in-out infinite",
        morph: "morph 17s ease-in-out infinite",
        drift: "drift 21s ease-in-out infinite",
        "core-drift": "core-drift 13s ease-in-out infinite",
        "orbit-spin": "orbit-spin 90s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
