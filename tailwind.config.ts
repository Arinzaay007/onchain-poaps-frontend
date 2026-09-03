import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme tokens driven by CSS variables so light + dark mode both work.
        // paper = warm cream (always light — used as light TEXT on dark surfaces).
        // surf  = the page/element SURFACE, which flips light↔dark.
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        surf: "rgb(var(--c-surf) / <alpha-value>)",
        parchment: "rgb(var(--c-parchment) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        faded: "rgb(var(--c-faded) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        white: "rgb(var(--c-white) / <alpha-value>)",
        // Brand colors — unchanged in both modes.
        accent: "#c73e1d",
        accentdark: "#9c2f14",
        stamp: "#345e94",
        gold: "#b98a2e",
        mint: "#3d7a4f",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(34,28,20,.08), 0 4px 16px rgba(34,28,20,.07)",
        lift: "0 2px 4px rgba(34,28,20,.1), 0 12px 32px rgba(34,28,20,.12)",
      },
      keyframes: {
        stampIn: {
          "0%": { transform: "scale(2.4) rotate(-14deg)", opacity: "0" },
          "55%": { transform: "scale(0.92) rotate(-7deg)", opacity: "1" },
          "75%": { transform: "scale(1.06) rotate(-8deg)" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0) rotate(var(--tilt, -6deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--tilt, -6deg))" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        slam: {
          "0%": { transform: "scale(3.2)", opacity: "0" },
          "42%": { transform: "scale(0.9)", opacity: "1" },
          "62%": { transform: "scale(1.07)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slamFade: {
          "0%,78%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        shake: {
          "0%,100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-4px,3px)" },
          "40%": { transform: "translate(4px,-2px)" },
          "60%": { transform: "translate(-3px,-3px)" },
          "80%": { transform: "translate(2px,2px)" },
        },
        sealL: {
          "0%": { transform: "translate(0,0) rotate(0)" },
          "100%": { transform: "translate(-14px,6px) rotate(-9deg)", opacity: "0.85" },
        },
        sealR: {
          "0%": { transform: "translate(0,0) rotate(0)" },
          "100%": { transform: "translate(13px,8px) rotate(8deg)", opacity: "0.85" },
        },
      },
      animation: {
        stampIn: "stampIn .45s cubic-bezier(.2,1.4,.4,1) forwards",
        fadeUp: "fadeUp .4s ease-out both",
        floaty: "floaty 7s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        slam: "slam .32s cubic-bezier(.2,1.4,.4,1)",
        slamFade: "slamFade .45s ease-out .05s both",
        shake: "shake .4s ease-in-out",
        sealL: "sealL .5s ease-out",
        sealR: "sealR .5s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
