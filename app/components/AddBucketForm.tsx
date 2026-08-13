"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addBucketItemAction, type ActionState } from "../actions";
import {
  ENTRY_TYPES,
  PEOPLE,
  PERSON_LABELS,
  TYPE_LABELS,
  TYPE_STYLE,
  type EntryType,
} from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn shrink-0">
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

export default function AddBucketForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(addBucketItemAction, {});
  const [type, setType] = useState<EntryType>("restaurant");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="panel p-3.5"
    >
      <p className="field-label mb-2">Add somewhere to try</p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="title"
          placeholder="A café, a restaurant, a dish to cook…"
          className="input flex-1"
          required
        />
        <input
          name="city"
          placeholder="Cambridge"
          defaultValue="Cambridge"
          className="input sm:w-36"
        />
        <SubmitButton />
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
        <input type="hidden" name="type" value={type} />

        {type === "cooking" && (
          <select name="cook" className="input !w-auto !py-1 font-mono text-[11px] ml-1">
            {PEOPLE.map((p) => (
              <option key={p} value={p}>
                {PERSON_LABELS[p]} cooks
              </option>
            ))}
          </select>
        )}
      </div>

      {state.error && <p className="font-body text-sm text-danger mt-2">{state.error}</p>}
    </form>
  );
}
