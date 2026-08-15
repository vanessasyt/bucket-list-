import Link from "next/link";
import { getBucketItems } from "@/lib/db";
import { DOMAIN_COPY, domainOf, isDomain } from "@/lib/types";
import Nav from "../components/Nav";
import EntryForm from "../components/EntryForm";

export const dynamic = "force-dynamic";

export default async function AddPage({
  searchParams,
}: {
  searchParams: { bucket?: string; domain?: string };
}) {
  // Arriving from "We went" on the wishlist prefills the form from that item
  let bucketItem = null;
  if (searchParams.bucket) {
    const id = Number(searchParams.bucket);
    if (Number.isFinite(id)) {
      const items = await getBucketItems();
      bucketItem = items.find((i) => i.id === id) ?? null;
    }
  }

  // A wishlist item already knows which half it belongs to, so ?domain= only
  // matters when starting from scratch. Food is the default.
  const domain = bucketItem
    ? domainOf(bucketItem.type)
    : isDomain(searchParams.domain)
      ? searchParams.domain
      : "food";
  const copy = DOMAIN_COPY[domain];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="add" domain={domain} />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-5 py-8">
          <div className="animate-rise">
            <Link
              href={copy.home}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink mb-4"
            >
              <span aria-hidden>&larr;</span> Back to map
            </Link>
            <p className="field-label">New entry</p>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
              {copy.addTitle}
            </h1>
            {bucketItem && (
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-2">
                From your list
              </p>
            )}
          </div>

          <div className="mt-7">
            <EntryForm
              defaultTitle={bucketItem?.title}
              defaultType={bucketItem?.type}
              defaultCity={bucketItem?.city}
              defaultCook={bucketItem?.cook}
              bucketItemId={bucketItem?.id ?? null}
              domain={domain}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
