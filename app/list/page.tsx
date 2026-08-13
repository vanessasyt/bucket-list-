import Link from "next/link";
import { getBucketItems, getEntries } from "@/lib/db";
import {
  ENTRY_TYPES,
  PERSON_LABELS,
  TYPE_LABELS,
  TYPE_STYLE,
  type BucketItem,
  type EntryType,
} from "@/lib/types";
import Nav from "../components/Nav";
import AddBucketForm from "../components/AddBucketForm";
import { deleteBucketItemAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const [items, entries] = await Promise.all([getBucketItems(), getEntries()]);
  const entryById = new Map(entries.map((e) => [e.id, e]));

  // Older versions of this app kept non-food items here too; they no longer
  // belong on a food diary's wishlist.
  const food = items.filter((i) => ENTRY_TYPES.includes(i.type));

  const todo = food.filter((i) => !i.entryId);
  const done = food.filter((i) => i.entryId);

  const groups: { type: EntryType; items: BucketItem[] }[] = ENTRY_TYPES.map((type) => ({
    type,
    items: todo.filter((i) => i.type === type),
  }));

  const pct = food.length ? Math.round((done.length / food.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="list" />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-5 py-8">
          <div className="flex items-end justify-between gap-4 animate-rise">
            <div>
              <p className="field-label">The wishlist</p>
              <h1 className="font-display text-4xl sm:text-5xl text-cream leading-tight">
                Want to try
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-3xl text-cream leading-none">
                {done.length}
                <span className="text-muted">/{food.length}</span>
              </p>
              <p className="field-label mt-1">{pct}% done</p>
            </div>
          </div>

          <div className="h-1 bg-surface-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-6">
            <AddBucketForm />
          </div>

          {groups.map(({ type, items: groupItems }) =>
            groupItems.length === 0 ? null : (
              <section key={type} className="mt-8">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className={`w-2 h-2 rounded-full ${TYPE_STYLE[type].bg}`} />
                  <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cream">
                    {TYPE_LABELS[type]}
                  </h2>
                  <span className="font-mono text-[10px] text-muted">{groupItems.length}</span>
                  <div className="flex-1 h-px bg-line" />
                </div>

                <ul className="space-y-1.5">
                  {groupItems.map((item) => (
                    <li
                      key={item.id}
                      className="group flex items-center gap-3 border border-line bg-surface rounded-sm px-3.5 py-2.5"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border ${TYPE_STYLE[item.type].border} shrink-0 opacity-60`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-[15px] text-cream leading-snug">
                          {item.title}
                        </p>
                        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-0.5">
                          {item.city}
                          {item.cook && ` · ${PERSON_LABELS[item.cook]} cooks`}
                        </p>
                      </div>

                      <Link
                        href={`/add?bucket=${item.id}`}
                        className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-cream border-b border-dashed border-line shrink-0"
                      >
                        We went
                      </Link>

                      <form action={deleteBucketItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          aria-label={`Remove ${item.title}`}
                          className="text-muted hover:text-accent-hot text-lg leading-none px-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
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

          {todo.length === 0 && (
            <p className="font-body text-sm text-muted italic mt-8">
              Nothing on the list. Add somewhere you want to go.
            </p>
          )}

          {done.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-2.5 mb-3">
                <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cream">
                  Been
                </h2>
                <div className="flex-1 h-px bg-line" />
              </div>

              <ul className="space-y-1.5">
                {done.map((item) => {
                  const entry = item.entryId ? entryById.get(item.entryId) : null;
                  return (
                    <li key={item.id}>
                      <Link
                        href={entry ? `/entry/${entry.id}` : "/list"}
                        className="flex items-center gap-3 border border-line bg-surface/50 rounded-sm px-3.5 py-2.5 hover:bg-surface"
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full ${TYPE_STYLE[item.type].bg} shrink-0 flex items-center justify-center text-ink text-[9px]`}
                        >
                          ✓
                        </span>
                        <p className="font-body text-[15px] text-muted line-through decoration-line flex-1 min-w-0 truncate">
                          {item.title}
                        </p>
                        {entry && (
                          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted shrink-0">
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
