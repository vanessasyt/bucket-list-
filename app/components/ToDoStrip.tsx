import Link from "next/link";
import { type BucketItem } from "@/lib/types";

// The bottom of the activity map, where the food map has its category bar.
//
// The map is what we've done; this is what we haven't. Each chip links to the
// prefilled add form, so finishing one moves it off this strip and onto the
// map as a pin — the whole screen is one before-and-after.
//
// No new server code behind this: /add?bucket=<id> already prefills from the
// item, and createEntry already sets bucket_items.entry_id, which is what
// takes the chip away.
export default function ToDoStrip({
  items,
  listHref,
}: {
  items: BucketItem[];
  listHref: string;
}) {
  if (items.length === 0) {
    return (
      <div className="panel px-4 py-2.5 pointer-events-auto text-center">
        <p className="font-body text-sm text-ink">
          Nothing left on the list.{" "}
          <Link href={listHref} className="underline decoration-line hover:text-accent-hot">
            Add something
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="panel px-3 py-2.5 pointer-events-auto max-w-full">
      <div className="flex items-baseline justify-between gap-3 mb-2 px-0.5">
        <p className="field-label">Still to do</p>
        <Link
          href={listHref}
          className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted hover:text-ink shrink-0"
        >
          {items.length} left ›
        </Link>
      </div>

      {/* Scrolls rather than wraps: a second row would eat the map, and the
          list is unbounded. */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/add?bucket=${item.id}`}
            title={`Tick off ${item.title}`}
            className="group shrink-0 flex items-center gap-2 rounded-full border border-line
                       bg-card hover:border-accent hover:bg-accent/5 px-3 py-1.5 transition-colors"
          >
            {/* An empty circle that fills on hover: the tick you're about to
                make. */}
            <span
              className="w-3.5 h-3.5 rounded-full border border-line shrink-0 flex items-center
                         justify-center text-[8px] text-transparent
                         group-hover:border-accent group-hover:bg-accent group-hover:text-white"
              aria-hidden
            >
              ✓
            </span>
            <span className="font-body text-[14px] text-ink whitespace-nowrap">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
