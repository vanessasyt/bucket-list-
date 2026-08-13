import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // A pale map with white cards floating on it. The map is the quietest
        // thing on screen so the coloured pins carry all the meaning.
        paper: "#EDEAE4",
        card: "#FFFFFF",
        "card-2": "#F4F1EB",
        line: "#DFD8CC",
        accent: "#C4553D",
        "accent-hot": "#A8442F",
        ink: "#2B2724",
        muted: "#7C736A",
        // One colour per kind of place, dark enough to carry white text
        cafe: "#5F7A4A",
        restaurant: "#C4553D",
        cooking: "#B07C2B",
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
