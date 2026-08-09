import { redirect } from "next/navigation";
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
      </div>
    </div>
  );
}
