import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentPerson } from "@/lib/auth";
import { getEntry } from "@/lib/db";
import {
  PEOPLE,
  PERSON_LABELS,
  TYPE_INK,
  TYPE_LABELS,
  ratingOf,
  reviewOf,
} from "@/lib/types";
import Nav from "@/app/components/Nav";
import Stamp from "@/app/components/Stamp";
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
  const person = currentPerson();

  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const entry = await getEntry(id);
  if (!entry) notFound();

  const ink = TYPE_INK[entry.type];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav person={person} active="map" />

      <main className="flex-1 security-print">
        <div className="mx-auto max-w-3xl px-4 sm:px-5 py-6">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.16em] uppercase text-navy-soft hover:text-navy"
          >
            ← Map
          </Link>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-start gap-5 animate-rise">
            <div className="shrink-0 self-center sm:self-start">
              <Stamp
                title={entry.title}
                type={entry.type}
                city={entry.city}
                date={entry.date}
                size="lg"
                seed={`${entry.title}${entry.date}`}
                animate
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className={`field-label ${ink.text}`}>
                {TYPE_LABELS[entry.type]}
                {entry.cook && ` · ${PERSON_LABELS[entry.cook]} cooked`}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-navy leading-none tracking-wide mt-1">
                {entry.title.toUpperCase()}
              </h1>
              <p className="font-body text-navy-soft mt-2">
                {longDate(entry.date)}
                {entry.placeName ? ` · ${entry.placeName}` : ""}
                {entry.city ? `, ${entry.city}` : ""}
              </p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-navy-soft/70 mt-1">
                {entry.lat.toFixed(4)}, {entry.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {entry.photos.length > 0 && (
            <div className="flex gap-3 overflow-x-auto mt-6 pb-2 -mx-1 px-1 snap-x">
              {entry.photos.map((url, i) => (
                <div
                  key={url + i}
                  className="shrink-0 w-44 sm:w-52 snap-center border border-navy/25 bg-page-light p-1.5 rounded-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full aspect-square object-cover rounded-sm" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <AddPhotos entryId={entry.id} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-7">
            {PEOPLE.map((p) => {
              const rating = ratingOf(entry, p);
              const review = reviewOf(entry, p);
              const isMe = p === person;
              const hasContent = review !== null || rating !== null;

              return (
                <section
                  key={p}
                  className="border border-navy/25 rounded-sm bg-page-light/70 p-4 flex flex-col"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-display text-2xl font-black text-navy tracking-wide">
                      {PERSON_LABELS[p].toUpperCase()}
                    </h2>
                    {rating !== null && (
                      <span className={`font-mono text-lg font-semibold ${ink.text}`}>
                        {rating}
                        <span className="text-navy-soft text-xs">/10</span>
                      </span>
                    )}
                  </div>

                  <div className="h-px bg-navy/15 my-3" />

                  {review && (
                    <p className="font-body text-[15px] leading-relaxed text-navy whitespace-pre-wrap mb-3">
                      {review}
                    </p>
                  )}

                  {isMe ? (
                    <ReviewForm
                      entryId={entry.id}
                      person={p}
                      existingRating={rating}
                      existingReview={review}
                    />
                  ) : (
                    !hasContent && (
                      <p className="font-body text-sm text-navy-soft italic">
                        {PERSON_LABELS[p]} hasn&rsquo;t written theirs yet.
                      </p>
                    )
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
