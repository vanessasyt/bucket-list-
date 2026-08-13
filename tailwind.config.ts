import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Dark charcoal chrome with a warm terracotta accent. Everything
        // floats over the map, so the surfaces are deliberately close in
        // value — the accent is the only loud colour.
        ink: "#17110F",
        surface: "#221B18",
        "surface-2": "#2E2521",
        line: "#3A302B",
        accent: "#C4553D",
        "accent-hot": "#D9674C",
        cream: "#F0E9E1",
        muted: "#8C8078",
        // One colour per kind of place, so pins and dots read without a legend
        cafe: "#7D8B5A",
        restaurant: "#C4553D",
        cooking: "#D9B26A",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "serif"],
        body: ["var(--font-newsreader)", "serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
