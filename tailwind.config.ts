import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f8f3e8",
        parchment: "#f1e9d8",
        ink: "#221c14",
        faded: "#6f6353",
        line: "#d9cdb6",
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
      },
      animation: {
        stampIn: "stampIn .45s cubic-bezier(.2,1.4,.4,1) forwards",
        fadeUp: "fadeUp .4s ease-out both",
        floaty: "floaty 7s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
