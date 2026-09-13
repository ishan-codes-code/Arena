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
