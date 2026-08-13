"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteEntryAction } from "../actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn bg-accent-hot hover:bg-accent whitespace-nowrap"
    >
      {pending ? "Deleting…" : "Yes, delete it"}
    </button>
  );
}

// Nothing here is password-protected, so deleting asks twice: once to reveal
// the button and once to press it.
export default function DeleteEntry({ entryId, title }: { entryId: number; title: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-accent-hot border-b border-dashed border-line"
      >
        Delete this entry
      </button>
    );
  }

  return (
    <div className="border border-accent/50 bg-accent/10 rounded-sm p-4">
      <p className="font-body text-sm text-ink">
        Delete <span className="italic">{title}</span>? Its photos, ratings and both write-ups go
        with it, and there is no undo.
      </p>
      <div className="flex items-center gap-3 mt-3">
        <form action={deleteEntryAction}>
          <input type="hidden" name="entryId" value={entryId} />
          <ConfirmButton />
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}
