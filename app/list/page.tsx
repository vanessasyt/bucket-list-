import Link from "next/link";
import { getBucketItems, getEntries } from "@/lib/db";
import {
  ENTRY_TYPES,
  TYPE_LABELS,
  TYPE_STYLE,
  type BucketItem,
  type EntryType,
} from "@/lib/types";
import Nav from "../components/Nav";
import AddBucketForm from "../components/AddBucketForm";
import BucketRow from "../components/BucketRow";
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
              <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
                Want to try
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-3xl text-ink leading-none">
                {done.length}
                <span className="text-muted">/{food.length}</span>
              </p>
              <p className="field-label mt-1">{pct}% done</p>
            </div>
          </div>

          <div className="h-1 bg-card-2 rounded-full mt-3 overflow-hidden">
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
                  <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink">
                    {TYPE_LABELS[type]}
                  </h2>
                  <span className="font-mono text-[10px] text-muted">{groupItems.length}</span>
                  <div className="flex-1 h-px bg-line" />
                </div>

                <ul className="space-y-1.5">
                  {groupItems.map((item) => (
                    <BucketRow key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            )
          )}

          {todo.length === 0 && (
            <p className="font-body text-sm text-muted mt-8">Nothing yet</p>
          )}

          {done.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-2.5 mb-3">
                <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink">
                  Been
                </h2>
                <div className="flex-1 h-px bg-line" />
              </div>

              <ul className="space-y-1.5">
                {done.map((item) => {
                  const entry = item.entryId ? entryById.get(item.entryId) : null;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 border border-line bg-card/50 rounded-sm px-3.5 py-2.5"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${TYPE_STYLE[item.type].bg} shrink-0 flex items-center justify-center text-white text-[9px]`}
                      >
                        ✓
                      </span>

                      {entry ? (
                        <Link
                          href={`/entry/${entry.id}`}
                          className="font-body text-[15px] text-muted line-through decoration-line flex-1 min-w-0 truncate hover:text-ink"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="font-body text-[15px] text-muted line-through decoration-line flex-1 min-w-0 truncate">
                          {item.title}
                        </span>
                      )}

                      {entry && (
                        <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted shrink-0">
                          {entry.date}
                        </span>
                      )}

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
                })}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
