"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveReviewAction, type ActionState } from "../actions";
import { PERSON_LABELS, type Person } from "@/lib/types";
import { rememberWho } from "./WhoPicker";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn mt-3">
      {pending ? "Saving…" : label}
    </button>
  );
}

// One half of a place's review. Which half is decided by `person`, not by
// who is logged in — there is no logging in. Opening the form is itself the
// claim that you are that person.
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
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => {
          rememberWho(person);
          setOpen(true);
        }}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink border-b border-dashed border-line self-start"
      >
        {hasExisting ? "Edit" : `Write ${PERSON_LABELS[person]}’s`}
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-1">
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="author" value={person} />

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
        <span className="field-label">{PERSON_LABELS[person]}&rsquo;s review</span>
        <textarea
          name="review"
          rows={6}
          defaultValue={existingReview ?? ""}
          className="input mt-1.5 resize-y"
        />
      </label>

      {state.error && <p className="font-body text-sm text-danger mt-2">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SaveButton label={hasExisting ? "Update" : "Save"} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink mt-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
