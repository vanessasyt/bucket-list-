import { currentPerson } from "@/lib/auth";
import { getEntries } from "@/lib/db";
import MapView from "./components/MapView";
import Nav from "./components/Nav";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const person = currentPerson();
  const entries = await getEntries();

  const counts = {
    total: entries.length,
    cities: new Set(entries.map((e) => e.city)).size,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav person={person} active="map" />

      <div className="flex-1 min-h-0 relative">
        <MapView entries={entries} />

        <div className="absolute bottom-4 left-4 z-[500] bg-page-light/95 border border-navy/25 rounded-sm px-3.5 py-2.5">
          <p className="field-label">Stamps collected</p>
          <p className="font-display text-3xl font-black text-navy leading-none mt-0.5">
            {counts.total}
          </p>
          <p className="font-mono text-[9px] tracking-[0.14em] text-navy-soft uppercase mt-1">
            {counts.cities} {counts.cities === 1 ? "city" : "cities"}
          </p>
        </div>

        <div className="absolute top-4 left-4 z-[500] bg-page-light/90 border border-navy/25 rounded-sm px-4 py-3 max-w-xs">
          <p className="font-display text-sm font-black text-navy uppercase tracking-[0.25em]">
            Map view
          </p>
          <p className="font-body text-sm text-navy-soft mt-1">
            Click London or Cambridge to zoom in. Stamps show the places we’ve been.
          </p>
        </div>

        <div className="absolute bottom-4 right-4 z-[500] flex items-center gap-3">
          <a
            href="/add"
            className="btn bg-vermilion hover:bg-[#f36c83] text-page"
          >
            Add entry
          </a>
        </div>
      </div>
    </div>
  );
}
