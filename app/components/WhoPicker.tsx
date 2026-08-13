"use client";

import { useEffect, useState } from "react";
import { PEOPLE, PERSON_LABELS, isPerson, type Person } from "@/lib/types";

const STORAGE_KEY = "food-diary-who";

export function rememberWho(person: Person) {
  try {
    window.localStorage.setItem(STORAGE_KEY, person);
  } catch {
    // Private browsing, or storage full. Not worth telling anyone about.
  }
}

function readWho(): Person | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isPerson(raw) ? raw : null;
  } catch {
    return null;
  }
}

// Instead of a password, whoever is writing says which of the two of them
// they are. The choice is remembered per device, so in practice you pick
// your name once and then never think about it again.
export default function WhoPicker({
  name = "author",
  value,
  onChange,
  label = "Who's writing?",
  remember = true,
}: {
  name?: string;
  value: Person;
  onChange: (person: Person) => void;
  label?: string;
  remember?: boolean;
}) {
  // Only consult localStorage after mount — reading it during render would
  // make the server and client markup disagree.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (restored || !remember) return;
    const saved = readWho();
    if (saved && saved !== value) onChange(saved);
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored, remember]);

  function pick(person: Person) {
    onChange(person);
    if (remember) rememberWho(person);
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex gap-1.5 mt-1.5">
        {PEOPLE.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pick(p)}
            aria-pressed={value === p}
            className={`font-mono text-[11px] tracking-[0.14em] uppercase px-3.5 py-2 rounded-sm border transition-colors ${
              value === p
                ? "border-accent bg-accent/15 text-ink"
                : "border-line text-muted hover:text-ink hover:border-muted"
            }`}
          >
            {PERSON_LABELS[p]}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
