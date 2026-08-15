import Link from "next/link";
import { DOMAIN_COPY, type Domain } from "@/lib/types";

// The fore-edge of the facing page: a tab tucked against the right edge that
// slides out when you reach for it. Two halves, one gesture between them.
//
// Pinned at 38% of the viewport height, with the map's zoom rail moved down
// to 62%, so the two never overlap. It sits above the map overlays (z 600)
// but below the timeline drawer (z 650), which slides in over this same edge
// and should cover it.
export default function BookFlip({ from }: { from: Domain }) {
  const copy = DOMAIN_COPY[from === "food" ? "activity" : "food"];

  return (
    <Link
      href={copy.home}
      aria-label={`Flip to ${copy.name}`}
      title={`Flip to ${copy.name}`}
      className="group fixed right-0 top-[38%] z-[620] flex flex-col items-center gap-2
                 rounded-l-xl border border-r-0 border-line bg-card/95 backdrop-blur
                 py-5 pl-2.5 pr-2 shadow-[-5px_0_16px_rgba(34,48,42,0.16)]
                 translate-x-1 hover:translate-x-0 focus-visible:translate-x-0
                 transition-transform duration-200"
    >
      <span
        className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted
                   group-hover:text-ink [writing-mode:vertical-rl]"
      >
        {copy.name}
      </span>

      {/* page-curl chevron */}
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted group-hover:text-accent transition-colors"
        aria-hidden
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </Link>
  );
}
