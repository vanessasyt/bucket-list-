"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveReviewAction, type ActionState } from "../actions";
import { PERSON_LABELS, type Person } from "@/lib/types";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn mt-3">
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function ReviewForm({
  entryId,
  person,
  existingRating,
  existingReview,
}: {
  entryId: number;
  person: Person;
  existingRating: number | null;
  existingReview: string | null;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(saveReviewAction, {});
  const hasExisting = existingReview !== null || existingRating !== null;
  const [open, setOpen] = useState(!hasExisting);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-navy-soft hover:text-navy border-b border-dashed border-navy/30"
      >
        Edit mine
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-1">
      <input type="hidden" name="entryId" value={entryId} />

      <label className="block">
        <span className="field-label">Out of 10</span>
        <input
          type="number"
          name="rating"
          step="0.5"
          min="0"
          max="10"
          defaultValue={existingRating ?? ""}
          className="input mt-1.5 sm:w-32"
        />
      </label>

      <label className="block mt-3">
        <span className="field-label">{PERSON_LABELS[person]}&rsquo;s write-up</span>
        <textarea
          name="review"
          rows={6}
          defaultValue={existingReview ?? ""}
          className="input mt-1.5 resize-y"
          placeholder="What it was actually like…"
        />
      </label>

      {state.error && <p className="font-body text-sm text-vermilion mt-2">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SaveButton label={hasExisting ? "Update" : "Add mine"} />
        {hasExisting && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono text-[10px] tracking-[0.14em] uppercase text-navy-soft hover:text-navy mt-3"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
