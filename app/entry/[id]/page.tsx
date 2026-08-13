import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/db";
import {
  PEOPLE,
  PERSON_LABELS,
  TYPE_LABELS_ONE,
  TYPE_STYLE,
  avgRating,
  formatRating,
  ratingColour,
  ratingOf,
  reviewOf,
} from "@/lib/types";
import Nav from "@/app/components/Nav";
import ReviewForm from "@/app/components/ReviewForm";
import AddPhotos from "@/app/components/AddPhotos";

export const dynamic = "force-dynamic";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function longDate(dateKey: string) {
  const [y, m, d] = dateKey.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export default async function EntryPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const entry = await getEntry(id);
  if (!entry) notFound();

  const style = TYPE_STYLE[entry.type];
  const cover = entry.photos[0];
  const avg = avgRating(entry);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="map" />

      <main className="flex-1">
        {/* Cover band */}
        {cover ? (
          <div className="relative h-48 sm:h-64 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
          </div>
        ) : (
          <div className="h-20" style={{ backgroundColor: `${style.hex}1A` }} />
        )}

        <div className="mx-auto max-w-3xl px-4 sm:px-5 pb-12 -mt-10 relative">
          <div className="flex items-start justify-between gap-4 animate-rise">
            <div className="min-w-0">
              <Link
                href="/"
                className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-ink"
              >
                ← Map
              </Link>

              <p className="field-label mt-3" style={{ color: style.hex }}>
                {TYPE_LABELS_ONE[entry.type]}
                {entry.cuisine && ` · ${entry.cuisine}`}
                {entry.cook && ` · ${PERSON_LABELS[entry.cook]} cooked`}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mt-1">
                {entry.title}
              </h1>
              <p className="font-body text-muted mt-1.5">
                {longDate(entry.date)}
                {entry.placeName ? ` · ${entry.placeName}` : ""}
                {entry.city ? `, ${entry.city}` : ""}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-3">
              <Link href={`/entry/${entry.id}/edit`} className="btn-ghost whitespace-nowrap">
                Edit entry
              </Link>
              {avg !== null && (
                <div className="text-right">
                  <p className="field-label">Between us</p>
                  <p
                    className="font-display text-3xl leading-none mt-0.5"
                    style={{ color: ratingColour(avg) }}
                  >
                    {formatRating(avg)}
                    <span className="text-muted text-base">/10</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {entry.photos.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-7 pb-1">
              {entry.photos.slice(1).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url + i}
                  src={url}
                  alt=""
                  className="shrink-0 w-36 h-36 object-cover rounded-sm border border-line"
                />
              ))}
            </div>
          )}

          <div className="mt-4">
            <AddPhotos entryId={entry.id} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {PEOPLE.map((p) => {
              const rating = ratingOf(entry, p);
              const review = reviewOf(entry, p);

              return (
                <section key={p} className="panel p-4 flex flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-display text-2xl text-ink">{PERSON_LABELS[p]}</h2>
                    {rating !== null && (
                      <span
                        className="font-mono text-lg font-semibold"
                        style={{ color: ratingColour(rating) }}
                      >
                        {formatRating(rating)}
                        <span className="text-muted text-xs">/10</span>
                      </span>
                    )}
                  </div>

                  <div className="h-px bg-line my-3" />

                  {review ? (
                    <p className="font-body text-[15px] leading-relaxed text-ink whitespace-pre-wrap mb-3">
                      {review}
                    </p>
                  ) : (
                    <p className="font-body text-sm text-muted mb-3">No review</p>
                  )}

                  <ReviewForm
                    entryId={entry.id}
                    person={p}
                    existingRating={rating}
                    existingReview={review}
                  />
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
