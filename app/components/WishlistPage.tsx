import Link from "next/link";
import { getBucketItems, getEntries } from "@/lib/db";
import {
  DOMAIN_COPY,
  KINDS,
  hasKinds,
  typesIn,
  type BucketItem,
  type Domain,
  type EntryType,
} from "@/lib/types";
import { deleteBucketItemAction } from "../actions";
import AddBucketForm from "./AddBucketForm";
import BucketRow from "./BucketRow";
import Nav from "./Nav";

// The wishlist for one half of the book. Both /list and /activities/list are
// this with a different domain.
export default async function WishlistPage({ domain }: { domain: Domain }) {
  const copy = DOMAIN_COPY[domain];
  const [items, entries] = await Promise.all([
    getBucketItems(domain),
    getEntries(domain),
  ]);
  const entryById = new Map(entries.map((e) => [e.id, e]));

  // No type filter here: getBucketItems already scoped the query to this
  // domain's kinds, which also drops rows from older versions of the app.
  const todo = items.filter((i) => !i.entryId);
  const done = items.filter((i) => i.entryId);

  // One kind means one flat list — a lone group header naming the only kind
  // there is would be pure furniture.
  const groups: { type: EntryType | null; items: BucketItem[] }[] = hasKinds(domain)
    ? typesIn(domain).map((type) => ({ type, items: todo.filter((i) => i.type === type) }))
    : [{ type: null, items: todo }];

  const pct = items.length ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="list" domain={domain} />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-5 py-8">
          <Link
            href={copy.home}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink mb-4"
          >
            <span aria-hidden>&larr;</span> Back to map
          </Link>

          <div className="flex items-end justify-between gap-4 animate-rise">
            <div>
              <p className="field-label">The wishlist</p>
              <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
                {copy.listTitle}
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-3xl text-ink leading-none">
                {done.length}
                <span className="text-muted">/{items.length}</span>
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
            <AddBucketForm domain={domain} />
          </div>

          {groups.map(({ type, items: groupItems }) =>
            groupItems.length === 0 ? null : (
              <section key={type ?? "all"} className="mt-8">
                {type !== null && (
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: KINDS[type].hex }}
                    />
                    <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink">
                      {KINDS[type].label}
                    </h2>
                    <span className="font-mono text-[10px] text-muted">{groupItems.length}</span>
                    <div className="flex-1 h-px bg-line" />
                  </div>
                )}

                <ul className="space-y-1.5">
                  {groupItems.map((item) => (
                    <BucketRow key={item.id} item={item} domain={domain} />
                  ))}
                </ul>
              </section>
            )
          )}

          {todo.length === 0 && (
            <p className="font-body text-sm text-muted mt-8">{copy.emptyList}</p>
          )}

          {done.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-2.5 mb-3">
                <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink">
                  {domain === "food" ? "Been" : "Done"}
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
                        className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-white text-[9px]"
                        style={{ backgroundColor: KINDS[item.type].hex }}
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
                          className="w-7 h-7 rounded-md border border-line text-muted hover:text-danger hover:border-danger text-base leading-none"
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
