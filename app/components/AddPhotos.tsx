"use client";

import { useCallback, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addPhotosAction, type ActionState } from "../actions";
import PhotoUploader from "./PhotoUploader";

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn mt-2.5">
      {pending ? "Saving…" : disabled ? "Uploading…" : "Add these"}
    </button>
  );
}

export default function AddPhotos({ entryId }: { entryId: number }) {
  const [state, formAction] = useFormState<ActionState, FormData>(addPhotosAction, {});
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handle = useCallback((urls: string[], isUploading: boolean) => {
    setPhotos(urls);
    setUploading(isUploading);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink border-b border-dashed border-line"
      >
        + Add photos
      </button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <PhotoUploader onChange={handle} compact />
      {state.error && <p className="font-body text-sm text-accent-hot mt-2">{state.error}</p>}
      <SaveButton disabled={uploading || photos.length === 0} />
    </form>
  );
}
