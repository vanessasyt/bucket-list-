import {
  TYPE_LABELS_ONE,
  TYPE_STYLE,
  avgRating,
  formatRating,
  ratingColour,
  type Entry,
} from "@/lib/types";

// The thumbnail: the first uploaded photo, or a tinted tile in the type's
// colour when there's no photo yet, so the strip never has holes in it.
function Thumb({ entry, size }: { entry: Entry; size: string }) {
  const style = TYPE_STYLE[entry.type];
  const cover = entry.photos[0];

  if (cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover}
        alt=""
        className={`${size} object-cover rounded-sm shrink-0 border border-line`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-sm shrink-0 border flex items-center justify-center`}
      style={{ borderColor: style.hex, backgroundColor: `${style.hex}22`, color: style.hex }}
      aria-hidden
    >
      <span className="font-mono text-[8px] tracking-[0.14em] uppercase px-1 text-center leading-tight">
        {TYPE_LABELS_ONE[entry.type]}
      </span>
    </div>
  );
}

// One place in the strip along the bottom of the map.
export default function PlaceCard({
  entry,
  selected,
  onSelect,
}: {
  entry: Entry;
  selected: boolean;
  onSelect: (entry: Entry) => void;
}) {
  const avg = avgRating(entry);
  const style = TYPE_STYLE[entry.type];

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className={`panel shrink-0 w-[236px] flex items-center gap-3 p-2.5 text-left transition-colors ${
        selected ? "border-accent" : "hover:border-muted"
      }`}
    >
      <Thumb entry={entry} size="w-12 h-12" />

      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] text-ink leading-tight truncate">{entry.title}</p>
        <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted mt-1 truncate">
          {entry.cuisine ? `${entry.cuisine} · ` : ""}
          {entry.city}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {avg !== null ? (
          <span className="font-mono text-sm font-semibold" style={{ color: ratingColour(avg) }}>
            {formatRating(avg)}
          </span>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">—</span>
        )}
      </div>
    </button>
  );
}

export { Thumb };
