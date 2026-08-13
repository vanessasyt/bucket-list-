"use client";

import { useEffect, useRef, useState } from "react";
import { uploadPhoto } from "../actions";

// Phone photos are several megabytes; server actions reject bodies far
// smaller than that, and the database shouldn't hold originals anyway. So
// the browser resizes before anything is sent.
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    // Keep whichever is smaller; a small PNG can beat its JPEG version.
    if (!blob) return file;
    return blob.size < file.size ? blob : file;
  } catch {
    // Formats the browser can't decode (some HEIC) fall through untouched
    // and are caught by the size check on the server.
    return file;
  }
}

interface Slot {
  id: string;
  url: string | null; // null while uploading
  error: string | null;
  preview: string;
}

export default function PhotoUploader({
  onChange,
  compact = false,
  initialUrls,
}: {
  onChange: (urls: string[], uploading: boolean) => void;
  compact?: boolean;
  // Photos the entry already has, when editing. They start as finished
  // slots so they can be reordered out — i.e. removed — like any other.
  initialUrls?: string[];
}) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    (initialUrls ?? []).map((url, i) => ({
      id: `existing-${i}-${url}`,
      url,
      error: null,
      preview: url,
    }))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current(
      slots.filter((s) => s.url).map((s) => s.url as string),
      slots.some((s) => !s.url && !s.error)
    );
  }, [slots]);

  async function upload(file: File) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setSlots((prev) => [
      ...prev,
      { id, url: null, error: null, preview: URL.createObjectURL(file) },
    ]);

    const shrunk = await shrink(file);
    const fd = new FormData();
    fd.set("file", shrunk, file.name.replace(/\.[^.]+$/, "") + ".jpg");
    const result = await uploadPhoto(fd);

    setSlots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              url: result.ok ? result.url! : null,
              error: result.ok ? null : result.error || "Failed",
            }
          : s
      )
    );
  }

  // Pasting works on phones and desktop alike, which is the quickest way
  // to get a photo in without going through the file picker.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) upload(file);
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const box = compact ? "w-16 h-16" : "w-20 h-20";

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {slots.map((s) => (
          <div key={s.id} className={`relative ${box} shrink-0`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.url ?? s.preview}
              alt=""
              className={`w-full h-full object-cover rounded-sm border ${
                s.error ? "border-danger opacity-40" : "border-line"
              } ${!s.url && !s.error ? "opacity-45" : ""}`}
            />
            {!s.url && !s.error && (
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] uppercase tracking-widest text-ink">
                …
              </span>
            )}
            {s.error && (
              <span
                className="absolute inset-0 flex items-center justify-center rounded-sm bg-danger/10 text-danger font-mono text-lg"
                title={s.error}
              >
                !
              </span>
            )}
            <button
              type="button"
              onClick={() => setSlots((prev) => prev.filter((x) => x.id !== s.id))}
              aria-label="Remove photo"
              className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] leading-none flex items-center justify-center ${
                s.error ? "bg-danger" : "bg-accent"
              }`}
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${box} shrink-0 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-muted hover:text-ink hover:border-muted transition-colors`}
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-mono text-[8px] tracking-[0.14em] uppercase mt-0.5">Photo</span>
        </button>
      </div>

      {/* Failures used to be 7px text inside the tile, which is easy to
          miss entirely. */}
      {slots.some((s) => s.error) && (
        <div className="mt-2.5 border border-danger/50 bg-danger/5 rounded-sm px-3 py-2">
          <p className="font-body text-sm text-danger">Some photos didn&rsquo;t upload.</p>
          <ul className="mt-1 space-y-0.5">
            {slots
              .filter((s) => s.error)
              .map((s) => (
                <li key={s.id} className="font-mono text-[10px] text-muted break-words">
                  {s.error}
                </li>
              ))}
          </ul>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) Array.from(files).forEach(upload);
          e.target.value = "";
        }}
      />
    </div>
  );
}
