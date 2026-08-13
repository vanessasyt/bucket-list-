"use client";

import { ENTRY_TYPES, TYPE_LABELS, TYPE_STYLE, type EntryType } from "@/lib/types";

export type Filter = EntryType | "all";

export const FILTERS: Filter[] = ["all", ...ENTRY_TYPES];

export function filterLabel(filter: Filter): string {
  return filter === "all" ? "Everywhere" : TYPE_LABELS[filter];
}

export function filterColour(filter: Filter): string {
  return filter === "all" ? "#C4553D" : TYPE_STYLE[filter].hex;
}

// Simple line icons, drawn rather than pulled from a font so there's no
// external request and they inherit currentColor.
function Icon({ filter }: { filter: Filter }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (filter === "all") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
    );
  }

  if (filter === "cafe") {
    return (
      <svg {...common} aria-hidden>
        <path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" />
        <path d="M16 10h2.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M7 3v2M11 3v2" />
      </svg>
    );
  }

  if (filter === "restaurant") {
    return (
      <svg {...common} aria-hidden>
        <path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10" />
        <path d="M17 3c-1.5 1.5-2 3.5-2 6s.5 3 2 3 2-.5 2-3-.5-4.5-2-6Zm0 9v9" />
      </svg>
    );
  }

  // cooking
  return (
    <svg {...common} aria-hidden>
      <path d="M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5Z" />
      <path d="M2 10h20" />
      <path d="M9 6c0-1 1-1.5 1-2.5M13 6c0-1 1-1.5 1-2.5" />
    </svg>
  );
}

// The bar along the bottom of the map. This is the only way to filter now
// that the rail is gone, so each button carries its count.
export default function CategoryBar({
  value,
  counts,
  onChange,
}: {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
}) {
  return (
    <div className="panel flex items-center gap-1 p-1.5 pointer-events-auto">
      {FILTERS.map((f) => {
        const active = f === value;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            aria-pressed={active}
            title={`${filterLabel(f)} (${counts[f]})`}
            className={`relative flex flex-col items-center justify-center w-[62px] sm:w-[76px] py-2 rounded-lg transition-colors ${
              active ? "text-white" : "text-muted hover:text-ink hover:bg-card-2"
            }`}
            style={active ? { backgroundColor: filterColour(f) } : undefined}
          >
            <Icon filter={f} />
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase mt-1 leading-none">
              {f === "all" ? "All" : TYPE_LABELS[f]}
            </span>
            <span
              className={`font-mono text-[8px] leading-none mt-0.5 ${
                active ? "text-white/80" : "text-muted"
              }`}
            >
              {counts[f]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
