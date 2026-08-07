import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Passport cover navy, used for chrome and heavy type
        navy: "#14213D",
        "navy-soft": "#3A4A6B",
        // Passport page stock — yellower than typical off-white
        page: "#EFE7D2",
        "page-deep": "#E4D9BE",
        "page-light": "#F7F2E5",
        // Foil
        gold: "#B8912F",
        // The three stamp inks, one per entry type
        violet: "#6B4E9E",
        teal: "#24726A",
        vermilion: "#B93B2B",
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
