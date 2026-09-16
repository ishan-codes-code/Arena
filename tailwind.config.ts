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
          red: "#D7263D",
          ink: "#121212",
          paper: "#F7F7F4",
          structural: "#6B6B68",
          hairline: "#D3D2CC",
          night: "#181818",
          nightText: "#F1F0EC",
          nightHairline: "#2A2A2A",
          live: "#1E9E8A",
          pending: "#B8860B",
        },
        palette: {
          red: "#D7263D",
          redBlock: "#D7263D",
          redAccent: "#D7263D",
          ink: "#121212",
          surface: "#121212",
          surfaceRaised: "#181818",
          text: "#F1F0EC",
          textMuted: "#A9A9A6",
          paper: "#F7F7F4",
          structural: "#6B6B68",
          hairline: "#D3D2CC",
          night: "#181818",
          nightText: "#F1F0EC",
          nightHairline: "#2A2A2A",
          live: "#1E9E8A",
          pending: "#B8860B",
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
