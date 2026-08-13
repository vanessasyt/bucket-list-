import Link from "next/link";

// The bar across the top of every page. On the map it floats over the tiles,
// so it keeps its own translucent background rather than sitting on the page.
export default function Nav({
  active,
  floating = false,
}: {
  active: "map" | "list" | "add";
  floating?: boolean;
}) {
  return (
    <header
      className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3 ${
        floating
          ? "absolute inset-x-0 top-0 z-[600] bg-gradient-to-b from-paper via-paper/85 to-transparent pb-8"
          : "bg-paper border-b border-line"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
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
            {/* candles */}
            <path d="M8 8V6M12 8V5M16 8V6" />
            <circle cx="8" cy="4.6" r="0.9" fill="#FFFFFF" stroke="none" />
            <circle cx="12" cy="3.6" r="0.9" fill="#FFFFFF" stroke="none" />
            <circle cx="16" cy="4.6" r="0.9" fill="#FFFFFF" stroke="none" />
            {/* iced top, body and plate */}
            <path d="M4 15.5c1.3 0 1.3-1.3 2.7-1.3s1.3 1.3 2.6 1.3 1.4-1.3 2.7-1.3 1.3 1.3 2.7 1.3 1.3-1.3 2.6-1.3 1.4 1.3 2.7 1.3" />
            <path d="M4 15.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3.5" />
            <path d="M4 10.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
          </svg>
        </span>
        <span className="font-display text-lg sm:text-xl text-ink whitespace-nowrap group-hover:text-accent-hot transition-colors">
          Food Diary
        </span>
      </Link>

      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/list"
          className={`font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase transition-colors ${
            active === "list" ? "text-accent-hot" : "text-muted hover:text-ink"
          }`}
        >
          Want to try
        </Link>
        <Link href="/add" className="btn whitespace-nowrap">
          + Add entry
        </Link>
      </nav>
    </header>
  );
}
