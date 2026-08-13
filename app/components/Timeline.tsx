"use client";

import {
  TYPE_STYLE,
  avgRating,
  formatRating,
  ratingColour,
  type Entry,
} from "@/lib/types";
import { TYPE_ICON_PATHS } from "./typeIcons";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthKey(dateKey: string): string {
  const [y, m] = dateKey.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function dayOf(dateKey: string): number {
  return Number(dateKey.split("-")[2]);
}

// 1st, 2nd, 3rd, 4th — with the 11th/12th/13th exception.
function ordinal(day: number): string {
  const teens = day % 100;
  if (teens >= 11 && teens <= 13) return "th";
  return { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
}

// Entries arrive newest first from the database, so grouping in order keeps
// the months in order too.
function groupByMonth(entries: Entry[]): { month: string; items: Entry[] }[] {
  const out: { month: string; items: Entry[] }[] = [];
  for (const e of entries) {
    const month = monthKey(e.date);
    const last = out[out.length - 1];
    if (last && last.month === month) last.items.push(e);
    else out.push({ month, items: [e] });
  }
  return out;
}

export default function Timeline({
  entries,
  selectedId,
  open,
  onSelect,
  onClose,
}: {
  entries: Entry[];
  selectedId: number | null;
  open: boolean;
  onSelect: (entry: Entry) => void;
  onClose: () => void;
}) {
  const groups = groupByMonth(entries);

  return (
    <div
      className={`absolute z-[650] top-0 right-0 h-full w-full sm:w-[320px] transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="h-full bg-card border-l border-line flex flex-col shadow-[-6px_0_20px_rgba(34,48,42,0.10)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line shrink-0">
          <div>
            <p className="field-label">Everywhere we&rsquo;ve been</p>
            <p className="font-display text-xl text-ink leading-none mt-1">
              {entries.length} {entries.length === 1 ? "place" : "places"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close list"
            className="w-8 h-8 rounded-lg border border-line text-muted hover:text-ink hover:border-muted text-lg leading-none shrink-0"
          >
            ×
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {entries.length === 0 && (
            <p className="font-body text-sm text-muted px-4 py-5">Nothing yet</p>
          )}

          {groups.map((group) => (
            <section key={group.month}>
              <h3 className="sticky top-0 bg-card-2 border-y border-line px-4 py-1.5 font-mono text-[9px] tracking-[0.2em] uppercase text-muted z-10">
                {group.month}
              </h3>

              <ul>
                {group.items.map((entry) => {
                  const avg = avgRating(entry);
                  const style = TYPE_STYLE[entry.type];
                  const active = entry.id === selectedId;

                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(entry)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 border-b border-line transition-colors ${
                          active ? "bg-accent/10" : "hover:bg-card-2"
                        }`}
                      >
                        <span className="font-mono text-[11px] text-muted w-8 shrink-0 text-right">
                          {dayOf(entry.date)}
                          <span className="text-[8px] align-super">
                            {ordinal(dayOf(entry.date))}
                          </span>
                        </span>

                        <span
                          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono text-[11px] font-semibold"
                          style={{
                            backgroundColor: avg === null ? "#FFFFFF" : ratingColour(avg),
                            color: avg === null ? style.hex : "#FFFFFF",
                            border: avg === null ? "1px dashed #DED7C8" : "none",
                          }}
                        >
                          {avg === null ? "–" : formatRating(avg)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="font-display text-[15px] text-ink leading-tight block truncate">
                            {entry.title}
                          </span>
                          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted block truncate mt-0.5">
                            {entry.cuisine ? `${entry.cuisine} · ` : ""}
                            {entry.city}
                          </span>
                        </span>

                        <svg
                          width={14}
                          height={14}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={style.hex}
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0"
                          aria-hidden
                        >
                          <path d={TYPE_ICON_PATHS[entry.type]} />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
