import { getEntries } from "@/lib/db";
import MapView from "./components/MapView";
import Nav from "./components/Nav";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const entries = await getEntries();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <Nav active="map" floating />
        <MapView entries={entries} />
      </div>
    </div>
  );
}
