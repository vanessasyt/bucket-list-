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
            {/* awning, then the shopfront under it */}
            <path d="M3.4 9.6 4.9 5.3A2 2 0 0 1 6.8 4h10.4a2 2 0 0 1 1.9 1.3l1.5 4.3" />
            <path d="M3.4 9.6h17.2" />
            <path d="M5.2 9.6V19a1.4 1.4 0 0 0 1.4 1.4h10.8A1.4 1.4 0 0 0 18.8 19V9.6" />
            {/* door */}
            <path d="M9.6 20.4v-4.6a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v4.6" />
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
