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
        <span className="w-6 h-6 rounded-sm bg-accent shrink-0 flex items-center justify-center text-white text-[13px] leading-none">
          ◆
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
