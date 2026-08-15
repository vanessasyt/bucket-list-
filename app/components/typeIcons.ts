import { KINDS, type EntryType } from "@/lib/types";

// Icon geometry lives in the KINDS registry as raw path data because it has
// to render two ways: as JSX in the category bar, and inside an HTML string
// in the map pins, which Leaflet injects through L.divIcon. Only the "all"
// glyph lives here, since it belongs to no single kind.
export const ALL_ICON =
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18";

export function iconPath(filter: EntryType | "all"): string {
  return filter === "all" ? ALL_ICON : KINDS[filter].icon;
}

// The same icon as a standalone SVG string, for the pin markup.
export function typeIconSvg(type: EntryType, size: number, colour: string): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${KINDS[type].icon}"/></svg>`;
}
