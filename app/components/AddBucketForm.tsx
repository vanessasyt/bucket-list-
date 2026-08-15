"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addBucketItemAction, type ActionState } from "../actions";
import {
  DOMAIN_COPY,
  KINDS,
  PEOPLE,
  PERSON_LABELS,
  hasCook,
  hasKinds,
  typesIn,
  type Domain,
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

export default function AddBucketForm({ domain }: { domain: Domain }) {
  const [state, formAction] = useFormState<ActionState, FormData>(addBucketItemAction, {});
  const [type, setType] = useState<EntryType>(DOMAIN_COPY[domain].defaultKind);
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
      <p className="field-label mb-2">
        {domain === "food" ? "Add somewhere to try" : "Add something to do"}
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="title"
          placeholder={
            domain === "food"
              ? "A café, a restaurant, a dish to cook…"
              : "Punting, a climb, a pottery class…"
          }
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
        {/* Nothing to pick when the half has one kind — the hidden input
            still carries it. */}
        {hasKinds(domain) &&
          typesIn(domain).map((t) => (
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
                style={{ backgroundColor: KINDS[t].hex }}
              />
              {KINDS[t].label}
            </button>
          ))}
        <input type="hidden" name="type" value={type} />

        {hasCook(type) && (
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
