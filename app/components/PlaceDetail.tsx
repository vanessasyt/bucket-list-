"use client";

import Link from "next/link";
import { useState } from "react";
import {
  KINDS,
  PEOPLE,
  PERSON_LABELS,
  domainOf,
  formatRating,
  hasKinds,
  hasLocation,
  ratingColour,
  ratingOf,
  type Entry,
} from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export default function PlaceDetail({
  entry,
  onClose,
}: {
  entry: Entry;
  onClose: () => void;
}) {
  const style = KINDS[entry.type];
  const [shown, setShown] = useState(0);
  const photos = entry.photos;
  const cover = photos[shown];

  return (
    <div className="panel w-full md:w-[300px] overflow-hidden animate-rise">
      <div className="relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="w-full h-32 object-cover" />
        ) : (
          <div
            className="w-full h-16 flex items-center justify-center"
            style={{ backgroundColor: `${style.hex}22` }}
          >
            <span
              className="font-mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: style.hex }}
            >
              {style.labelOne}
            </span>
          </div>
        )}

        {photos.length > 1 && (
          <span className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-white bg-ink/60 rounded px-1.5 py-0.5">
            {shown + 1}/{photos.length}
          </span>
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

      {photos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-2.5 pt-2.5">
          {photos.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setShown(i)}
              aria-label={`Photo ${i + 1}`}
              className={`shrink-0 rounded overflow-hidden border-2 transition-colors ${
                i === shown ? "border-accent" : "border-transparent hover:border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-[52px] h-[52px] object-cover block" />
            </button>
          ))}
        </div>
      )}

      <div className="p-3.5">
        {/* On a half with one kind the label would read the same on every
            card and tell you nothing, so it only appears when there is a
            real distinction to draw. */}
        {(entry.cuisine || hasKinds(domainOf(entry.type)) || entry.cook) && (
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: style.hex }}>
            {entry.cuisine || (hasKinds(domainOf(entry.type)) ? style.labelOne : "")}
            {entry.cook && ` · ${PERSON_LABELS[entry.cook]} cooked`}
          </p>
        )}
        <h2 className="font-display text-xl text-ink leading-tight mt-1">{entry.title}</h2>
        <p className="font-body text-[13px] text-muted mt-0.5 leading-snug">
          {entry.placeName ? `${entry.placeName}, ` : ""}
          {entry.city}
        </p>
        <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted mt-1">
          {shortDate(entry.date)}
          {/* The card can be opened from the list as well as from a pin, so
              say when there is no pin to have come from. */}
          {!hasLocation(entry) && " · Not on the map"}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-line">
          {PEOPLE.map((p) => {
            const rating = ratingOf(entry, p);
            return (
              <div key={p}>
                <p className="field-label">{PERSON_LABELS[p]}</p>
                <p className="font-mono text-lg mt-0.5">
                  {rating === null ? (
                    <span className="text-muted text-sm">—</span>
                  ) : (
                    <span style={{ color: ratingColour(rating) }}>
                      {formatRating(rating)}
                      <span className="text-muted text-[11px]">/10</span>
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <Link href={`/entry/${entry.id}`} className="btn w-full block text-center mt-3.5">
          Open
        </Link>
      </div>
    </div>
  );
}
