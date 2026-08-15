import {
  KINDS,
  avgRating,
  formatRating,
  ratingColour,
  type Entry,
} from "@/lib/types";
import { typeIconSvg } from "./typeIcons";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

// Fixed-size box so Leaflet can anchor it. The pin sits at the top and the
// cuisine label hangs below, so the anchor is the pin's point, not the
// centre of the box.
export const PIN_BOX_W = 108;
export const PIN_BOX_H = 66;
export const PIN_TIP_Y = 46;
export const CITY_PIN_SIZE = 56;

// Markers go into Leaflet as raw HTML via L.divIcon, so these build strings.

export function pinHtml(entry: Entry, selected: boolean): string {
  const avg = avgRating(entry);
  const rated = avg !== null;
  const fill = ratingColour(avg);

  // Rated pins are solid in their band colour with white contents. Unrated
  // ones are hollow, so an unscored place never looks like a bad one.
  const fg = rated ? "#FFFFFF" : KINDS[entry.type].hex;
  const border = rated ? "#FFFFFF" : "#DED7C8";
  const borderStyle = rated ? "solid" : "dashed";
  const label = rated ? formatRating(avg) : "–";

  const h = selected ? 40 : 34;
  const ring = selected ? "box-shadow:0 0 0 3px #3E7B52,0 3px 10px rgba(34,48,42,.3);" : "box-shadow:0 3px 10px rgba(34,48,42,.28);";

  const subtitle = entry.cuisine
    ? `<div style="
         margin-top:4px;max-width:${PIN_BOX_W}px;
         font-family:var(--font-plex-mono),monospace;font-size:8.5px;
         letter-spacing:.1em;text-transform:uppercase;color:#22302A;
         background:rgba(255,255,255,.94);border:1px solid #DED7C8;border-radius:4px;
         padding:1.5px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
         box-shadow:0 1px 4px rgba(34,48,42,.14);
       ">${escapeHtml(entry.cuisine)}</div>`
    : "";

  return `
    <div style="width:${PIN_BOX_W}px;display:flex;flex-direction:column;align-items:center;">
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          height:${h}px;padding:0 9px;border-radius:${h / 2}px;
          background:${fill};color:${fg};
          display:flex;align-items:center;gap:4px;
          font-family:var(--font-plex-mono),monospace;
          font-size:${selected ? 13 : 12}px;font-weight:600;
          border:2px ${borderStyle} ${border};${ring}
        ">
          ${typeIconSvg(entry.type, 13, fg)}
          <span>${label}</span>
        </div>
        <div style="
          width:0;height:0;margin-top:-1px;
          border-left:5px solid transparent;border-right:5px solid transparent;
          border-top:7px solid ${rated ? fill : "#DED7C8"};
          filter:drop-shadow(0 2px 1px rgba(34,48,42,.2));
        "></div>
      </div>
      ${subtitle}
    </div>`;
}

// The zoomed-out marker carries the same signal: its ring is the colour of
// that city's average score.
export function cityPinHtml(city: string, count: number, average: number | null): string {
  const ring = average === null ? "#DED7C8" : ratingColour(average);
  return `
    <div style="
      width:${CITY_PIN_SIZE}px;height:${CITY_PIN_SIZE}px;border-radius:9999px;
      background:#fff;border:3px solid ${ring};color:#22302A;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(34,48,42,.2);
    ">
      <span style="font-family:var(--font-newsreader),serif;font-size:18px;line-height:1">${count}</span>
      <span style="font-family:var(--font-plex-mono),monospace;font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:#7A7A6E;margin-top:2px;max-width:44px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(
        city
      )}</span>
    </div>`;
}
