"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { login, type ActionState } from "../actions";
import { PEOPLE, PERSON_LABELS, type Person } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn w-full">
      {pending ? "Checking…" : "Enter"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<ActionState, FormData>(login, {});
  const [person, setPerson] = useState<Person>("vanessa");

  return (
    <main className="min-h-screen security-print flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-rise">
        <div className="border-2 border-navy rounded-sm bg-page-light overflow-hidden">
          <div className="bg-navy px-5 py-4">
            <p className="font-mono text-[9px] tracking-[0.3em] text-page/70 uppercase">
              Joint record of travel
            </p>
            <h1 className="font-display text-4xl font-black text-page leading-none mt-1 tracking-wide">
              TUDOR &amp; VANESSA
            </h1>
          </div>

          <form action={formAction} className="px-5 py-6 space-y-5">
            <input type="hidden" name="person" value={person} />

            <div>
              <p className="field-label mb-2">Bearer</p>
              <div className="grid grid-cols-2 gap-2">
                {PEOPLE.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPerson(p)}
                    className={`font-mono text-[11px] tracking-[0.16em] uppercase py-2.5 rounded-sm border transition-colors ${
                      person === p
                        ? "bg-navy text-page border-navy"
                        : "border-navy/30 text-navy hover:bg-page"
                    }`}
                  >
                    {PERSON_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="field-label">Password</span>
              <input type="password" name="password" className="input mt-1.5" autoFocus />
            </label>

            {state.error && (
              <p className="font-body text-sm text-vermilion border border-vermilion/40 bg-vermilion/5 rounded-sm px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>

          <div className="mrz text-[9px] text-navy/45 bg-page-deep/60 px-5 py-2.5 border-t border-navy/15 overflow-hidden whitespace-nowrap">
            P&lt;GBRTUDOR&lt;&lt;VANESSA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </div>
        </div>
      </div>
    </main>
  );
}
