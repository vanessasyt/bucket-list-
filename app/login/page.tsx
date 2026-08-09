"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login, type ActionState } from "../actions";

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

  return (
    <main className="min-h-screen security-print flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-rise">
        <div className="border-2 border-navy rounded-sm bg-page-light overflow-hidden">
          <div className="bg-navy px-5 py-4">
            <h1 className="font-display text-4xl font-black text-page leading-none mt-1 tracking-wide">
              BUCKET LIST
            </h1>
          </div>

          <form action={formAction} className="px-5 py-6 space-y-5">
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
