import Link from "next/link";
import { DOMAINS, DOMAIN_COPY, type Domain } from "@/lib/types";

// Which half you're in, and the way to the other one. Both are named at
// once so the second half is discoverable without hunting — the previous
// version tucked a tab half off the right edge and set it in 10px vertical
// mono, which asked you to already know it was there.
//
// Newsreader at 14px rather than the tracked micro-mono used for field
// labels: that style is right for labelling a value and wrong for a control
// you're meant to press.
function DomainSwitch({ current }: { current: Domain }) {
  return (
    <div
      className="flex items-center rounded-full border border-line bg-card-2 p-0.5 shrink-0 shadow-inner"
      role="group"
      aria-label="Which diary"
    >
      {DOMAINS.map((d) => {
        const active = d === current;
        const copy = DOMAIN_COPY[d];
        return (
          <Link
            key={d}
            href={copy.home}
            aria-current={active ? "page" : undefined}
            // Each half fills in its own colour rather than a shared accent,
            // so the switch says which world you're in, not just which
            // button is pressed. The inactive side lifts slightly on hover —
            // the page it leads to is the interesting part of this control.
            className={`group flex items-center gap-1.5 font-display text-[14px] leading-none
                        px-3.5 py-1.5 rounded-full whitespace-nowrap
                        transition-all duration-200 ${
                          active
                            ? "text-white shadow-sm"
                            : "text-muted hover:text-ink hover:-translate-y-px"
                        }`}
            style={active ? { backgroundColor: copy.hex } : undefined}
          >
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`shrink-0 transition-transform duration-200 ${
                active ? "" : "group-hover:scale-110"
              }`}
              aria-hidden
            >
              {d === "food" ? <FoodMark /> : <ActivityMark />}
            </svg>
            {copy.name}
          </Link>
        );
      })}
    </div>
  );
}

// The shopfront, for the food half.
function FoodMark() {
  return (
    <>
      {/* awning, then the shopfront under it */}
      <path d="M3.4 9.6 4.9 5.3A2 2 0 0 1 6.8 4h10.4a2 2 0 0 1 1.9 1.3l1.5 4.3" />
      <path d="M3.4 9.6h17.2" />
      <path d="M5.2 9.6V19a1.4 1.4 0 0 0 1.4 1.4h10.8A1.4 1.4 0 0 0 18.8 19V9.6" />
      {/* door */}
      <path d="M9.6 20.4v-4.6a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v4.6" />
    </>
  );
}

// A compass, for the activity half — the going-out-and-doing-something half.
function ActivityMark() {
  return (
    <>
      <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Z" />
      <path d="m15.4 8.6-1.9 4.9-4.9 1.9 1.9-4.9 4.9-1.9Z" />
    </>
  );
}

// The bar across the top of every page. On the map it floats over the tiles,
// so it keeps its own translucent background rather than sitting on the page.
export default function Nav({
  active,
  floating = false,
  domain,
}: {
  active: "map" | "list" | "add";
  floating?: boolean;
  domain: Domain;
}) {
  const copy = DOMAIN_COPY[domain];

  return (
    <header
      className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3 ${
        floating
          ? "absolute inset-x-0 top-0 z-[600] bg-gradient-to-b from-paper via-paper/85 to-transparent pb-8"
          : "bg-paper border-b border-line"
      }`}
    >
      {/* Home is this half's map, not always the food one — otherwise the
          wordmark quietly flips you back to the other page. */}
      <Link href={copy.home} className="flex items-center gap-2.5 min-w-0 group">
        <span className="w-7 h-7 rounded-md bg-accent shrink-0 flex items-center justify-center">
          <svg
            width={17}
            height={17}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {domain === "food" ? <FoodMark /> : <ActivityMark />}
          </svg>
        </span>
        {/* The wordmark is the first thing to go when space is tight — the
            switch beside it already says where you are. */}
        <span className="hidden sm:inline font-display text-lg sm:text-xl text-ink whitespace-nowrap group-hover:text-accent-hot transition-colors">
          {copy.wordmark}
        </span>
      </Link>

      <DomainSwitch current={domain} />

      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href={copy.list}
          className={`font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase whitespace-nowrap transition-colors ${
            active === "list" ? "text-accent-hot" : "text-muted hover:text-ink"
          }`}
        >
          {copy.listTitle}
        </Link>
        <Link href={copy.addHref} className="btn whitespace-nowrap">
          + Add
        </Link>
      </nav>
    </header>
  );
}
