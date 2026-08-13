import { getBucketItems } from "@/lib/db";
import Nav from "../components/Nav";
import EntryForm from "../components/EntryForm";

export const dynamic = "force-dynamic";

export default async function AddPage({
  searchParams,
}: {
  searchParams: { bucket?: string };
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

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="add" />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-5 py-8">
          <div className="animate-rise">
            <p className="field-label">New entry</p>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
              Add a place
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}
