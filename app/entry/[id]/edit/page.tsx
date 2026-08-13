import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/db";
import Nav from "@/app/components/Nav";
import EntryForm from "@/app/components/EntryForm";
import DeleteEntry from "@/app/components/DeleteEntry";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const entry = await getEntry(id);
  if (!entry) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="add" />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-5 py-8">
          <div className="animate-rise">
            <Link
              href={`/entry/${entry.id}`}
              className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-ink"
            >
              ← Back
            </Link>
            <p className="field-label mt-3">Editing</p>
            <h1 className="font-display text-4xl text-ink leading-tight">{entry.title}</h1>
          </div>

          <div className="mt-7">
            <EntryForm mode="edit" entry={entry} />
          </div>

          <div className="mt-10 pt-6 border-t border-line">
            <DeleteEntry entryId={entry.id} title={entry.title} />
          </div>
        </div>
      </main>
    </div>
  );
}
