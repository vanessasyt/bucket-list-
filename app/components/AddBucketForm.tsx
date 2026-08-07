"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addBucketItemAction, type ActionState } from "../actions";
import { PEOPLE, PERSON_LABELS, TYPE_LABELS, type EntryType } from "@/lib/types";

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
  const [type, setType] = useState<EntryType>("activity");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="border border-navy/20 rounded-sm bg-page-light p-3.5"
    >
      <p className="field-label mb-2">Add something to do</p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="title"
          placeholder="Punting, a new restaurant, a dish to cook…"
          className="input flex-1"
          required
        />
        <input name="city" placeholder="Cambridge" defaultValue="Cambridge" className="input sm:w-36" />
        <SubmitButton />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        {(Object.keys(TYPE_LABELS) as EntryType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border transition-colors ${
              type === t ? "bg-navy text-page border-navy" : "border-navy/25 text-navy-soft hover:bg-page"
            }`}
          >
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

      {state.error && <p className="font-body text-sm text-vermilion mt-2">{state.error}</p>}
    </form>
  );
}
