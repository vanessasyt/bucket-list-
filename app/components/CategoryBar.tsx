"use client";

import {
  DOMAIN_COPY,
  KINDS,
  typesIn,
  type Domain,
  type EntryType,
} from "@/lib/types";
import { iconPath } from "./typeIcons";

export type Filter = EntryType | "all";

// Each half of the book only ever offers its own kinds, so the food map
// never shows a bouldering button.
export function filtersFor(domain: Domain): Filter[] {
  return ["all", ...typesIn(domain)];
}

export function filterLabel(filter: Filter, domain: Domain): string {
  return filter === "all" ? DOMAIN_COPY[domain].allLabel : KINDS[filter].label;
}

export function filterColour(filter: Filter): string {
  return filter === "all" ? "#3E7B52" : KINDS[filter].hex;
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
      <path d={iconPath(filter)} />
    </svg>
  );
}

// The bar along the bottom of the map. Each button carries its count.
// It scrolls rather than wraps: five activity kinds plus "all" overflows a
// narrow phone, and a wrapped second row would cover the map.
export default function CategoryBar({
  value,
  counts,
  onChange,
  domain,
}: {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
  domain: Domain;
}) {
  return (
    <div className="panel flex items-center gap-1 p-1.5 pointer-events-auto max-w-full overflow-x-auto no-scrollbar">
      {filtersFor(domain).map((f) => {
        const active = f === value;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            aria-pressed={active}
            title={`${filterLabel(f, domain)} (${counts[f]})`}
            className={`relative shrink-0 flex flex-col items-center justify-center w-[62px] sm:w-[76px] py-2 rounded-lg transition-colors ${
              active ? "text-white" : "text-muted hover:text-ink hover:bg-card-2"
            }`}
            style={active ? { backgroundColor: filterColour(f) } : undefined}
          >
            <Icon filter={f} />
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase mt-1 leading-none">
              {f === "all" ? "All" : KINDS[f].label}
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
