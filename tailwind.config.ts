import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          red: "#D94A3D",
          ink: "#111514",
          paper: "#F4F1EA",
          structural: "#656D69",
          hairline: "#D5D1C7",
          night: "#080B0C",
          nightText: "#F4F1E8",
          nightHairline: "#28302F",
          live: "#3DB7A3",
          pending: "#8978D9",
        },
        palette: {
          red: "#D94A3D",
          redBlock: "#D94A3D",
          redAccent: "#D94A3D",
          ink: "#111514",
          surface: "#040607",
          surfaceRaised: "#0A0F10",
          text: "#F4F1E8",
          textMuted: "#A4ABA7",
          paper: "#F4F1EA",
          structural: "#656D69",
          hairline: "#202A29",
          night: "#040607",
          nightText: "#F4F1E8",
          nightHairline: "#202A29",
          live: "#3DB7A3",
          pending: "#8978D9",
        },
      },
      fontSize: {
        numeric: ["0.8125rem", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        stat: ["0.6875rem", { lineHeight: "0.9", letterSpacing: "-0.015em" }],
      },
      fontFamily: {
        display: ["Archivo", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
