import Link from "next/link";
import { redirect } from "next/navigation";
import { currentPerson } from "@/lib/auth";
import { getBucketItems, getEntries } from "@/lib/db";
import { PERSON_LABELS, TYPE_INK, TYPE_LABELS, type EntryType } from "@/lib/types";
import Nav from "../components/Nav";
import AddBucketForm from "../components/AddBucketForm";
import { deleteBucketItemAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const person = currentPerson();
  const [items, entries] = await Promise.all([getBucketItems(), getEntries()]);
  const entryById = new Map(entries.map((e) => [e.id, e]));

  const todo = items.filter((i) => !i.entryId);
  const done = items.filter((i) => i.entryId);

  // Grouped so the page reads as three collections rather than one long list
  const groups: { type: EntryType; items: typeof todo }[] = (
    ["activity", "restaurant", "cooking"] as EntryType[]
  ).map((type) => ({ type, items: todo.filter((i) => i.type === type) }));

  const pct = items.length ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav person={person} active="list" />

      <main className="flex-1 security-print">
        <div className="mx-auto max-w-3xl px-4 sm:px-5 py-6">
          <div className="flex items-end justify-between gap-4 animate-rise">
            <div>
              <p className="field-label">The list</p>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-navy leading-none tracking-wide">
                THINGS TO DO
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-3xl font-black text-navy leading-none">
                {done.length}
                <span className="text-navy-soft">/{items.length}</span>
              </p>
              <p className="field-label mt-0.5">{pct}% stamped</p>
            </div>
          </div>

          <div className="h-1.5 bg-page-deep rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-6">
            <AddBucketForm />
          </div>

          {groups.map(({ type, items: groupItems }) =>
            groupItems.length === 0 ? null : (
              <section key={type} className="mt-7">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${TYPE_INK[type].bg}`} />
                  <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-navy">
                    {TYPE_LABELS[type]}
                  </h2>
                  <span className="font-mono text-[10px] text-navy-soft">{groupItems.length}</span>
                  <div className="flex-1 h-px bg-navy/15" />
                </div>

                <ul className="space-y-1.5">
                  {groupItems.map((item) => (
                    <li
                      key={item.id}
                      className="group flex items-center gap-3 border border-navy/15 bg-page-light rounded-sm px-3.5 py-2.5"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 ${TYPE_INK[item.type].border} shrink-0 opacity-45`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-[15px] text-navy leading-snug">{item.title}</p>
                        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-navy-soft mt-0.5">
                          {item.city}
                          {item.cook && ` · ${PERSON_LABELS[item.cook]} cooks`}
                        </p>
                      </div>

                      <Link
                        href={`/add?bucket=${item.id}`}
                        className="font-mono text-[10px] tracking-[0.14em] uppercase text-navy-soft hover:text-navy border-b border-dashed border-navy/30 shrink-0"
                      >
                        We did it
                      </Link>

                      <form action={deleteBucketItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          aria-label={`Remove ${item.title}`}
                          className="text-navy/25 hover:text-vermilion text-lg leading-none px-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </section>
            )
          )}

          {done.length > 0 && (
            <section className="mt-9">
              <div className="flex items-center gap-2.5 mb-3">
                <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-navy">
                  Stamped
                </h2>
                <div className="flex-1 h-px bg-navy/15" />
              </div>

              <ul className="space-y-1.5">
                {done.map((item) => {
                  const entry = item.entryId ? entryById.get(item.entryId) : null;
                  return (
                    <li key={item.id}>
                      <Link
                        href={entry ? `/entry/${entry.id}` : "/list"}
                        className="flex items-center gap-3 border border-navy/15 bg-page-light/60 rounded-sm px-3.5 py-2.5 hover:bg-page-light"
                      >
                        <span
                          className={`w-4 h-4 rounded-full ${TYPE_INK[item.type].bg} shrink-0 flex items-center justify-center text-page text-[10px]`}
                        >
                          ✓
                        </span>
                        <p className="font-body text-[15px] text-navy-soft line-through decoration-navy/30 flex-1 min-w-0 truncate">
                          {item.title}
                        </p>
                        {entry && (
                          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-navy-soft shrink-0">
                            {entry.date}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
