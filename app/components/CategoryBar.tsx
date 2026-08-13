"use client";

import { ENTRY_TYPES, TYPE_LABELS, TYPE_STYLE, type EntryType } from "@/lib/types";
import { TYPE_ICON_PATHS } from "./typeIcons";

export type Filter = EntryType | "all";

export const FILTERS: Filter[] = ["all", ...ENTRY_TYPES];

export function filterLabel(filter: Filter): string {
  return filter === "all" ? "Everywhere" : TYPE_LABELS[filter];
}

export function filterColour(filter: Filter): string {
  return filter === "all" ? "#3E7B52" : TYPE_STYLE[filter].hex;
}

function Icon({ filter }: { filter: Filter }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={TYPE_ICON_PATHS[filter]} />
    </svg>
  );
}

// The bar along the bottom of the map. Each button carries its count.
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
