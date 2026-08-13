import type { EntryType } from "@/lib/types";

// Icon geometry lives here as raw path data because it has to render two
// ways: as JSX in the category bar, and inside an HTML string in the map
// pins, which Leaflet injects through L.divIcon.
export const TYPE_ICON_PATHS: Record<EntryType | "all", string> = {
  all: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18",
  cafe: "M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM16 10h2.5a2.5 2.5 0 0 1 0 5H16M7 3v2M11 3v2",
  restaurant: "M6 3v8a2 2 0 0 0 4 0V3M8 11v10M17 3c-1.5 1.5-2 3.5-2 6s.5 3 2 3 2-.5 2-3-.5-4.5-2-6Zm0 9v9",
  cooking: "M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5ZM2 10h20M9 6c0-1 1-1.5 1-2.5M13 6c0-1 1-1.5 1-2.5",
};

// The same icon as a standalone SVG string, for the pin markup.
export function typeIconSvg(type: EntryType, size: number, colour: string): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${TYPE_ICON_PATHS[type]}"/></svg>`;
}
