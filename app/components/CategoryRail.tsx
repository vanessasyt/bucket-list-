"use client";

import { ENTRY_TYPES, TYPE_LABELS, TYPE_STYLE, type EntryType } from "@/lib/types";

export type Filter = EntryType | "all";

export const FILTERS: Filter[] = ["all", ...ENTRY_TYPES];

export function filterLabel(filter: Filter): string {
  return filter === "all" ? "Everywhere" : TYPE_LABELS[filter];
}

// The rail down the left of the map. The selected category grows into a
// large serif heading with its count in superscript; the others sit back as
// small muted labels, so the eye lands on where you are.
export default function CategoryRail({
  value,
  counts,
  onChange,
}: {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
}) {
  return (
    <>
      {/* Desktop: vertical rail */}
      <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-[600] flex-col items-start gap-1">
        <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted mb-2 [writing-mode:vertical-rl] rotate-180 absolute -left-5 top-1/2 -translate-y-1/2">
          Food Diary
        </span>

        {FILTERS.map((f) => {
          const active = f === value;
          const hex = f === "all" ? "#C4553D" : TYPE_STYLE[f].hex;

          return (
            <button
              key={f}
              type="button"
              onClick={() => onChange(f)}
              aria-pressed={active}
              className="text-left transition-colors leading-none"
            >
              {active ? (
                <span className="font-display text-[40px] lg:text-[46px] text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  {filterLabel(f)}
                  <sup className="ml-1.5 text-[15px]" style={{ color: hex }}>
                    ({counts[f]})
                  </sup>
                </span>
              ) : (
                <span className="font-display text-[17px] text-muted hover:text-cream drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] block py-1.5">
                  {filterLabel(f)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: the same choice as a row of chips under the top bar */}
      <div className="md:hidden absolute top-[58px] inset-x-0 z-[600] flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-2">
        {FILTERS.map((f) => {
          const active = f === value;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onChange(f)}
              aria-pressed={active}
              className={`panel shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 ${
                active ? "border-accent text-cream" : "text-muted"
              }`}
            >
              {filterLabel(f)} <span className="opacity-60">{counts[f]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
