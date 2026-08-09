import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // A richer blue base with brighter accents for a more playful passport.
        navy: "#071240",
        "navy-soft": "#4B6FB5",
        page: "#0D172F",
        "page-deep": "#121E3B",
        "page-light": "#1B2B55",
        gold: "#F59E0B",
        violet: "#A855F7",
        teal: "#14B8A6",
        vermilion: "#FB7185",
      },
      fontFamily: {
        display: ["var(--font-big-shoulders)", "sans-serif"],
        body: ["var(--font-newsreader)", "serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
