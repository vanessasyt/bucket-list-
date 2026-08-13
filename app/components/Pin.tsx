import { TYPE_STYLE, avgRating, formatRating, type Entry } from "@/lib/types";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

// The marker is a fixed-size box so Leaflet can anchor it; the pin sits at
// the top of that box and the cuisine label hangs underneath, which means
// the anchor point is the tip of the pin, not the centre of the box.
export const PIN_BOX_W = 104;
export const PIN_BOX_H = 62;
export const PIN_TIP_Y = 44; // distance from the top of the box to the pin's point
export const CITY_PIN_SIZE = 56;

// Markers go into Leaflet as raw HTML via L.divIcon, so these build strings
// rather than React elements.

export function pinHtml(entry: Entry, selected: boolean): string {
  const style = TYPE_STYLE[entry.type];
  const avg = avgRating(entry);
  const rating = avg === null ? "–" : formatRating(avg);
  const size = selected ? 42 : 36;
  const fill = selected ? "#C4553D" : style.hex;

  // Deliberately no name here — the cuisine is the only hint until you click.
  const subtitle = entry.cuisine
    ? `<div style="
         margin-top:4px;max-width:${PIN_BOX_W}px;
         font-family:var(--font-plex-mono),monospace;font-size:8.5px;
         letter-spacing:.1em;text-transform:uppercase;color:#2B2724;
         background:rgba(255,255,255,.92);border:1px solid #DFD8CC;border-radius:4px;
         padding:1.5px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
         box-shadow:0 1px 4px rgba(43,39,36,.14);
       ">${escapeHtml(entry.cuisine)}</div>`
    : "";

  return `
    <div style="width:${PIN_BOX_W}px;display:flex;flex-direction:column;align-items:center;">
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:${size}px;height:${size}px;border-radius:11px;
          background:${fill};color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-family:var(--font-plex-mono),monospace;
          font-size:${selected ? 13 : 12}px;font-weight:600;
          border:2px solid #fff;
          box-shadow:0 3px 10px rgba(43,39,36,.30);
        ">${rating}</div>
        <div style="
          width:0;height:0;margin-top:-2px;
          border-left:5px solid transparent;border-right:5px solid transparent;
          border-top:7px solid ${fill};
          filter:drop-shadow(0 2px 1px rgba(43,39,36,.20));
        "></div>
      </div>
      ${subtitle}
    </div>`;
}

export function cityPinHtml(city: string, count: number): string {
  return `
    <div style="
      width:${CITY_PIN_SIZE}px;height:${CITY_PIN_SIZE}px;border-radius:9999px;
      background:#fff;border:1px solid #DFD8CC;color:#2B2724;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(43,39,36,.20);
    ">
      <span style="font-family:var(--font-newsreader),serif;font-size:18px;line-height:1">${count}</span>
      <span style="font-family:var(--font-plex-mono),monospace;font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:#7C736A;margin-top:2px;max-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(
        city
      )}</span>
    </div>`;
}
