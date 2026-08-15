import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EC",
        card: "#FFFFFF",
        "card-2": "#F1EDE3",
        line: "#DED7C8",
        accent: "#3E7B52",
        "accent-hot": "#33684A",
        ink: "#22302A",
        danger: "#C2455E",
        muted: "#7A7A6E",

        // Category: which kind of place it is.
        cafe: "#2FA37A",
        restaurant: "#C2455E",
        cooking: "#8259A8",

        // Activities. Spread 60-70° apart in hue so they stay separable at
        // pin size, and kept clear of the rating bands — kind colour is the
        // glyph on an unrated pin, so anything near olive or dusty pink
        // would read as a score.
        punting: "#2C6E9B",
        bouldering: "#C4703A",
        pottery: "#9B4C7E",
        walk: "#5F8C3F",
        outing: "#6455A8",

        // Rating: how good it was. Kept apart from the category colours so
        // neither has to mean two things.
        "rating-1": "#16704A",
        "rating-2": "#4E9E5F",
        "rating-3": "#A9A63C",
        "rating-4": "#B5657B",
        "rating-5": "#8C8C93",
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
