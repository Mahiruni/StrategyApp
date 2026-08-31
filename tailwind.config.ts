import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        line: "var(--line)",
        ink: "var(--text)",
        muted: "var(--text-2)",
        faint: "var(--text-3)",
        mint: "var(--mint)",
        coral: "var(--coral)",
        gold: "var(--gold)",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono Variable", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel:
          "0 1px 0 rgba(255,255,255,.03) inset, 0 18px 50px rgba(0,0,0,.16)",
        float:
          "0 20px 70px rgba(0,0,0,.42), 0 1px 0 rgba(255,255,255,.08) inset",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(.16,1,.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
