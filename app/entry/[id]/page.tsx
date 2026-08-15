import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/db";
import {
  DOMAIN_COPY,
  KINDS,
  PEOPLE,
  PERSON_LABELS,
  avgRating,
  domainOf,
  formatRating,
  hasKinds,
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

  const style = KINDS[entry.type];
  const avg = avgRating(entry);
  // One entry route serves both halves; the entry's own kind says which one
  // it belongs to, so the nav and the back link point the right way.
  const domain = domainOf(entry.type);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="map" domain={domain} />

      <main className="flex-1">
        <div className="h-3" style={{ backgroundColor: `${style.hex}22` }} />

        <div className="mx-auto max-w-3xl px-4 sm:px-5 pt-7 pb-12 relative">
          <div className="flex items-start justify-between gap-4 animate-rise">
            <div className="min-w-0">
              <Link
                href={DOMAIN_COPY[domain].home}
                className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-ink"
              >
                ← Map
              </Link>

              {/* The kind only earns a line when the half has more than one
                  of them; otherwise it reads the same on every entry. */}
              {(hasKinds(domain) || entry.cuisine || entry.cook) && (
                <p className="field-label mt-3" style={{ color: style.hex }}>
                  {hasKinds(domain) ? style.labelOne : entry.cuisine}
                  {hasKinds(domain) && entry.cuisine && ` · ${entry.cuisine}`}
                  {entry.cook && ` · ${PERSON_LABELS[entry.cook]} cooked`}
                </p>
              )}
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

          {entry.photos.length > 0 && (
            <div className="flex flex-wrap gap-6 mt-9 px-1">
              {entry.photos.map((url, i) => (
                <figure
                  key={url + i}
                  className="bg-white p-2.5 pb-9 border border-line shadow-[0_4px_14px_rgba(34,48,42,0.16)] shrink-0"
                  // A fixed tilt per position, so the server and the browser
                  // agree on the angle.
                  style={{ transform: `rotate(${[-2, 1.5, -1, 2.5, -1.5][i % 5]}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] object-cover block"
                  />
                </figure>
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
