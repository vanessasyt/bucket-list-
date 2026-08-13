"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  ENTRY_TYPES,
  PEOPLE,
  PERSON_LABELS,
  TYPE_LABELS,
  TYPE_STYLE,
  type BucketItem,
  type EntryType,
} from "@/lib/types";
import {
  deleteBucketItemAction,
  updateBucketItemAction,
  type ActionState,
} from "../actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn shrink-0">
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function BucketRow({ item }: { item: BucketItem }) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateBucketItemAction, {});
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<EntryType>(item.type);

  if (editing) {
    return (
      <li className="border border-accent rounded-sm bg-card p-3">
        <form
          action={async (fd) => {
            await formAction(fd);
            setEditing(false);
          }}
        >
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="type" value={type} />

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              name="title"
              defaultValue={item.title}
              className="input flex-1"
              aria-label="Name"
              required
            />
            <input
              name="city"
              defaultValue={item.city}
              className="input sm:w-36"
              aria-label="City"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {ENTRY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border transition-colors ${
                  type === t
                    ? "bg-accent/15 border-accent text-ink"
                    : "border-line text-muted hover:text-ink hover:border-muted"
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: TYPE_STYLE[t].hex }}
                />
                {TYPE_LABELS[t]}
              </button>
            ))}

            {type === "cooking" && (
              <select
                name="cook"
                defaultValue={item.cook ?? "tudor"}
                className="input !w-auto !py-1 font-mono text-[11px]"
                aria-label="Who cooks"
              >
                {PEOPLE.map((p) => (
                  <option key={p} value={p}>
                    {PERSON_LABELS[p]} cooks
                  </option>
                ))}
              </select>
            )}
          </div>

          {state.error && (
            <p className="font-body text-sm text-accent-hot mt-2">{state.error}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <SaveButton />
            <button
              type="button"
              onClick={() => {
                setType(item.type);
                setEditing(false);
              }}
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 border border-line bg-card rounded-sm px-3.5 py-2.5">
      <span
        className={`w-3.5 h-3.5 rounded-full border ${TYPE_STYLE[item.type].border} shrink-0 opacity-60`}
      />

      <div className="min-w-0 flex-1">
        <p className="font-body text-[15px] text-ink leading-snug">{item.title}</p>
        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-0.5">
          {item.city}
          {item.cook && ` · ${PERSON_LABELS[item.cook]} cooks`}
        </p>
      </div>

      <Link
        href={`/add?bucket=${item.id}`}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink border-b border-dashed border-line shrink-0"
      >
        We went
      </Link>

      {/* Always visible: these used to appear on hover only, which put them
          out of reach on a phone. */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-ink border-b border-dashed border-line shrink-0"
      >
        Edit
      </button>

      <form action={deleteBucketItemAction} className="shrink-0">
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          aria-label={`Remove ${item.title}`}
          className="w-7 h-7 rounded-md border border-line text-muted hover:text-accent-hot hover:border-accent-hot text-base leading-none"
        >
          ×
        </button>
      </form>
    </li>
  );
}
