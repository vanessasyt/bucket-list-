"use client";

import { useCallback, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createEntryAction, type ActionState } from "../actions";
import {
  PEOPLE,
  PERSON_LABELS,
  TYPE_LABELS,
  type EntryType,
  type Person,
} from "@/lib/types";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import PhotoUploader from "./PhotoUploader";
import Stamp from "./Stamp";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn w-full">
      {pending ? "Stamping…" : disabled ? "Waiting for photos…" : "Stamp it"}
    </button>
  );
}

export default function EntryForm({
  person,
  defaultTitle,
  defaultType,
  defaultCity,
  defaultCook,
  bucketItemId,
}: {
  person: Person;
  defaultTitle?: string;
  defaultType?: EntryType;
  defaultCity?: string;
  defaultCook?: Person | null;
  bucketItemId?: number | null;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(createEntryAction, {});

  const [title, setTitle] = useState(defaultTitle ?? "");
  const [type, setType] = useState<EntryType>(defaultType ?? "activity");
  const [cook, setCook] = useState<Person>(defaultCook ?? "tudor");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loc, setLoc] = useState<PickedLocation | null>(null);
  const [cityOverride, setCityOverride] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotos = useCallback((urls: string[], isUploading: boolean) => {
    setPhotos(urls);
    setUploading(isUploading);
  }, []);

  const city = cityOverride || loc?.city || defaultCity || "";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="lat" value={loc?.lat ?? ""} />
      <input type="hidden" name="lng" value={loc?.lng ?? ""} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="placeName" value={loc?.placeName ?? ""} />
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <input type="hidden" name="type" value={type} />
      {bucketItemId ? <input type="hidden" name="bucketItemId" value={bucketItemId} /> : null}
      {type === "cooking" && <input type="hidden" name="cook" value={cook} />}

      {state.error && (
        <p className="font-body text-sm text-vermilion border border-vermilion/40 bg-vermilion/5 rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}

      {/* Live preview of the stamp being earned */}
      {title && date && (
        <div className="flex justify-center py-1">
          <Stamp
            title={title}
            type={type}
            city={city || "—"}
            date={date}
            size="md"
            seed={`${title}${date}`}
          />
        </div>
      )}

      <div>
        <p className="field-label mb-2">What kind</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TYPE_LABELS) as EntryType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase py-2 rounded-sm border transition-colors ${
                type === t
                  ? "bg-navy text-page border-navy"
                  : "border-navy/25 text-navy-soft hover:bg-page-light"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {type === "cooking" && (
        <div>
          <p className="field-label mb-2">Who cooked</p>
          <div className="grid grid-cols-2 gap-2">
            {PEOPLE.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCook(p)}
                className={`font-mono text-[10px] tracking-[0.14em] uppercase py-2 rounded-sm border transition-colors ${
                  cook === p
                    ? "bg-navy text-page border-navy"
                    : "border-navy/25 text-navy-soft hover:bg-page-light"
                }`}
              >
                {PERSON_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">What</span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input mt-1.5"
            placeholder="Bouldering"
            required
          />
        </label>
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
          <span className="field-label">City on the stamp</span>
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
        <PhotoUploader onChange={handlePhotos} />
      </div>

      <fieldset className="border border-navy/25 rounded-sm p-4">
        <legend className="field-label px-1.5">{PERSON_LABELS[person]}&rsquo;s verdict</legend>
        <label className="block">
          <span className="field-label">Out of 10</span>
          <input
            type="number"
            name="rating"
            step="0.5"
            min="0"
            max="10"
            className="input mt-1.5 sm:w-32"
          />
        </label>
        <label className="block mt-3">
          <span className="field-label">Write-up</span>
          <textarea name="review" rows={5} className="input mt-1.5 resize-y" />
        </label>
        <p className="font-body text-[13px] text-navy-soft italic mt-2">
          {PERSON_LABELS[person === "vanessa" ? "tudor" : "vanessa"]} adds theirs from the entry
          page.
        </p>
      </fieldset>

      <SubmitButton disabled={uploading} />
    </form>
  );
}
