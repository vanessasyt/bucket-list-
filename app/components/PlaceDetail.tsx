import Link from "next/link";
import {
  PEOPLE,
  PERSON_LABELS,
  TYPE_LABELS_ONE,
  TYPE_STYLE,
  formatRating,
  ratingOf,
  type Entry,
} from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

// The card that appears when a place is selected — a quick look at it
// without leaving the map. The full write-ups live on the entry page.
export default function PlaceDetail({
  entry,
  onClose,
}: {
  entry: Entry;
  onClose: () => void;
}) {
  const style = TYPE_STYLE[entry.type];
  const cover = entry.photos[0];

  return (
    <div className="panel w-full md:w-[300px] overflow-hidden animate-rise">
      <div className="relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="w-full h-28 object-cover" />
        ) : (
          <div
            className="w-full h-16 flex items-center justify-center"
            style={{ backgroundColor: `${style.hex}22` }}
          >
            <span
              className="font-mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: style.hex }}
            >
              {TYPE_LABELS_ONE[entry.type]}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-sm bg-white/85 text-muted hover:text-ink text-sm leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-3.5">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: style.hex }}>
          {entry.cuisine || TYPE_LABELS_ONE[entry.type]}
          {entry.cook && ` · ${PERSON_LABELS[entry.cook]} cooked`}
        </p>
        <h2 className="font-display text-xl text-ink leading-tight mt-1">{entry.title}</h2>
        <p className="font-body text-[13px] text-muted mt-0.5 leading-snug">
          {entry.placeName ? `${entry.placeName}, ` : ""}
          {entry.city}
        </p>
        <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted mt-1">
          {shortDate(entry.date)}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-line">
          {PEOPLE.map((p) => {
            const rating = ratingOf(entry, p);
            return (
              <div key={p}>
                <p className="field-label">{PERSON_LABELS[p]}</p>
                <p className="font-mono text-lg text-ink mt-0.5">
                  {rating === null ? (
                    <span className="text-muted text-sm">—</span>
                  ) : (
                    <>
                      {formatRating(rating)}
                      <span className="text-muted text-[11px]">/10</span>
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <Link
          href={`/entry/${entry.id}`}
          className="btn w-full block text-center mt-3.5"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
