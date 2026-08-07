import { redirect } from "next/navigation";
import { currentPerson } from "@/lib/auth";
import { getBucketItems } from "@/lib/db";
import Nav from "../components/Nav";
import EntryForm from "../components/EntryForm";

export const dynamic = "force-dynamic";

export default async function AddPage({
  searchParams,
}: {
  searchParams: { bucket?: string };
}) {
  const person = currentPerson();
  if (!person) redirect("/login");

  // Arriving from "We did it" on the list pre-fills the form from that item
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
      <Nav person={person} active="add" />

      <main className="flex-1 security-print">
        <div className="mx-auto max-w-2xl px-4 sm:px-5 py-6">
          <div className="animate-rise">
            <p className="field-label">New entry</p>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-navy leading-none tracking-wide">
              LOG A STAMP
            </h1>
            {bucketItem && (
              <p className="font-body text-sm text-navy-soft mt-2 italic">
                Crossing &ldquo;{bucketItem.title}&rdquo; off the list.
              </p>
            )}
          </div>

          <div className="mt-6">
            <EntryForm
              person={person}
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
