/** @type {import('tailwindcss').Config} */
// Design tokens — semantic tailwind classes driven by CSS variables
// so a single `.dark` class flips the whole palette (light + dark mode).
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        content: "rgb(var(--content) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          strong: "rgb(var(--primary-strong) / <alpha-value>)",
          contrast: "rgb(var(--primary-contrast) / <alpha-value>)",
        },
        magenta: "#972c83",
        coral: "#f58f8a",
        // Keep legacy "cyber" aliases so older references never break.
        "cyber-bg": "#0A0A0B",
        "cyber-accent": "#972c83",
        "cyber-text": "#EBEBEB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        serif: ["Newsreader", "Georgia", "serif"],
        newsreader: ["Newsreader", "serif"],
        mono: ["Space Grotesk", "monospace"],
        "space-grotesk": ["Space Grotesk", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(151, 44, 131, 0.35)",
        "glow-lg": "0 0 48px rgba(151, 44, 131, 0.45)",
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 16px rgba(151,44,131,0.3)" },
          "50%": { boxShadow: "0 0 32px rgba(151,44,131,0.6)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s infinite linear",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
