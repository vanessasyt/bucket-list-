"use client";

import { useCallback, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createEntryAction, updateEntryAction, type ActionState } from "../actions";
import {
  ENTRY_TYPES,
  hasCuisine,
  PEOPLE,
  PERSON_LABELS,
  TYPE_LABELS,
  TYPE_STYLE,
  type Entry,
  type EntryType,
  type Person,
} from "@/lib/types";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import PhotoUploader from "./PhotoUploader";
import PlaceCard from "./PlaceCard";
import WhoPicker from "./WhoPicker";

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn w-full">
      {pending ? "Saving…" : disabled ? "Waiting for photos…" : label}
    </button>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-mono text-[10px] tracking-[0.14em] uppercase py-2 px-2 rounded-sm border transition-colors ${
        active
          ? "bg-accent/15 border-accent text-ink"
          : "border-line text-muted hover:text-ink hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}

export default function EntryForm({
  mode = "create",
  entry,
  defaultTitle,
  defaultType,
  defaultCity,
  defaultCook,
  bucketItemId,
}: {
  mode?: "create" | "edit";
  entry?: Entry;
  defaultTitle?: string;
  defaultType?: EntryType;
  defaultCity?: string;
  defaultCook?: Person | null;
  bucketItemId?: number | null;
}) {
  const isEdit = mode === "edit" && entry !== undefined;

  const [state, formAction] = useFormState<ActionState, FormData>(
    isEdit ? updateEntryAction : createEntryAction,
    {}
  );

  const [author, setAuthor] = useState<Person>("vanessa");
  const [title, setTitle] = useState(entry?.title ?? defaultTitle ?? "");
  const [type, setType] = useState<EntryType>(entry?.type ?? defaultType ?? "restaurant");
  const [cook, setCook] = useState<Person>(entry?.cook ?? defaultCook ?? "tudor");
  const [date, setDate] = useState(
    () => entry?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [loc, setLoc] = useState<PickedLocation | null>(
    entry
      ? {
          lat: entry.lat,
          lng: entry.lng,
          city: entry.city,
          placeName: entry.placeName ?? "",
        }
      : null
  );
  const [cuisine, setCuisine] = useState(entry?.cuisine ?? "");
  const [cityOverride, setCityOverride] = useState(entry?.city ?? "");
  const [photos, setPhotos] = useState<string[]>(entry?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState("");

  const handlePhotos = useCallback((urls: string[], isUploading: boolean) => {
    setPhotos(urls);
    setUploading(isUploading);
  }, []);

  const city = cityOverride || loc?.city || defaultCity || "";

  // A stand-in Entry so the card in the preview is literally the same
  // component that will appear in the strip on the map.
  const preview: Entry = {
    id: entry?.id ?? -1,
    title: title || "Untitled",
    type,
    date,
    city: city || "—",
    placeName: loc?.placeName ?? null,
    cuisine: hasCuisine(type) ? cuisine || null : null,
    lat: loc?.lat ?? 0,
    lng: loc?.lng ?? 0,
    photos,
    cook: type === "cooking" ? cook : null,
    vanessaRating: rating ? Number(rating) : null,
    vanessaReview: null,
    tudorRating: null,
    tudorReview: null,
  };

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="entryId" value={entry.id} />}
      <input type="hidden" name="lat" value={loc?.lat ?? ""} />
      <input type="hidden" name="lng" value={loc?.lng ?? ""} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="placeName" value={loc?.placeName ?? ""} />
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <input type="hidden" name="type" value={type} />
      {bucketItemId ? <input type="hidden" name="bucketItemId" value={bucketItemId} /> : null}
      {type === "cooking" && <input type="hidden" name="cook" value={cook} />}

      {state.error && (
        <p className="font-body text-sm text-accent-hot border border-accent/40 bg-accent/10 rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}

      {/* How this place will look on the map */}
      <div className="flex justify-center py-1">
        <PlaceCard entry={preview} selected onSelect={() => {}} />
      </div>

      <div>
        <p className="field-label mb-2">What kind</p>
        <div className="grid grid-cols-3 gap-2">
          {ENTRY_TYPES.map((t) => (
            <Choice key={t} active={type === t} onClick={() => setType(t)}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: TYPE_STYLE[t].hex }}
              />
              {TYPE_LABELS[t]}
            </Choice>
          ))}
        </div>
      </div>

      {type === "cooking" && (
        <div>
          <p className="field-label mb-2">Who cooked</p>
          <div className="grid grid-cols-2 gap-2">
            {PEOPLE.map((p) => (
              <Choice key={p} active={cook === p} onClick={() => setCook(p)}>
                {PERSON_LABELS[p]}
              </Choice>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Name</span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input mt-1.5"
            placeholder="Buren"
            required
          />
        </label>

        {/* Sits beside the name because it reads as part of it: the label
            under the pin on the map. */}
        {hasCuisine(type) ? (
          <label className="block">
            <span className="field-label">Cuisine</span>
            <input
              name="cuisine"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="input mt-1.5"
              placeholder="Brunch, Italian, Korean…"
            />
          </label>
        ) : (
          <div className="hidden sm:block" aria-hidden />
        )}

        <label className="block">
          <span className="field-label">When</span>
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input mt-1.5"
            required
          />
        </label>
      </div>

      <div>
        <p className="field-label mb-1.5">Where</p>
        <LocationPicker value={loc} onChange={setLoc} />
        <label className="block mt-2">
          <span className="field-label">City</span>
          <input
            value={cityOverride || loc?.city || defaultCity || ""}
            onChange={(e) => setCityOverride(e.target.value)}
            className="input mt-1.5"
            placeholder="Cambridge"
          />
        </label>
      </div>

      <div>
        <p className="field-label mb-2">Photos</p>
        <PhotoUploader onChange={handlePhotos} initialUrls={entry?.photos} />
        <p className="font-body text-[13px] text-muted italic mt-2">
          The first photo becomes the cover.
        </p>
      </div>

      {/* Ratings only on the way in. Once a place exists, both write-ups
          are edited side by side on its own page. */}
      {!isEdit && (
        <fieldset className="border border-line rounded-sm p-4 space-y-4">
          <legend className="field-label px-1.5">First verdict</legend>

          <WhoPicker value={author} onChange={setAuthor} />

          <label className="block">
            <span className="field-label">Out of 10</span>
            <input
              type="number"
              name="rating"
              step="0.5"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="input mt-1.5 sm:w-32"
            />
          </label>

          <label className="block">
            <span className="field-label">Write-up</span>
            <textarea
              name="review"
              rows={5}
              className="input mt-1.5 resize-y"
              placeholder="What it was actually like…"
            />
          </label>

          <p className="font-body text-[13px] text-muted italic">
            {PERSON_LABELS[author === "vanessa" ? "tudor" : "vanessa"]} adds theirs from the place&rsquo;s
            page.
          </p>
        </fieldset>
      )}

      <SubmitButton disabled={uploading} label={isEdit ? "Save changes" : "Add to the diary"} />
    </form>
  );
}
