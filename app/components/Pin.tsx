import { TYPE_STYLE, avgRating, formatRating, type Entry } from "@/lib/types";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

export const PIN_SIZE = 30;
export const PIN_SELECTED_SIZE = 40;
export const CITY_PIN_SIZE = 54;

// Markers are injected into Leaflet as raw HTML through L.divIcon, so these
// build strings rather than React elements. Kept next to each other so the
// three marker states stay visually consistent.

export function pinHtml(entry: Entry, selected: boolean): string {
  const style = TYPE_STYLE[entry.type];
  const avg = avgRating(entry);
  const label = avg === null ? "·" : formatRating(avg);
  const size = selected ? PIN_SELECTED_SIZE : PIN_SIZE;
  const ring = selected ? "#C4553D" : style.hex;
  const fill = selected ? "#C4553D" : "rgba(23,17,15,0.88)";
  const text = selected ? "#F0E9E1" : style.hex;

  return `
    <div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      border:2px solid ${ring};background:${fill};color:${text};
      display:flex;align-items:center;justify-content:center;
      font-family:var(--font-plex-mono),monospace;
      font-size:${selected ? 12 : 10}px;font-weight:600;
      box-shadow:0 2px 10px rgba(0,0,0,0.55);
      transition:width .15s ease,height .15s ease;
    " title="${escapeHtml(entry.title)}">${label}</div>`;
}

export function cityPinHtml(city: string, count: number): string {
  return `
    <div style="
      width:${CITY_PIN_SIZE}px;height:${CITY_PIN_SIZE}px;border-radius:9999px;
      border:1px solid #3A302B;background:rgba(34,27,24,0.92);color:#F0E9E1;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      box-shadow:0 2px 14px rgba(0,0,0,0.6);
    ">
      <span style="font-family:var(--font-newsreader),serif;font-size:17px;line-height:1">${count}</span>
      <span style="font-family:var(--font-plex-mono),monospace;font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:#8C8078;margin-top:2px;max-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(
        city
      )}</span>
    </div>`;
}
