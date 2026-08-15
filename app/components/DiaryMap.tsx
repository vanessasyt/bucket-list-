import { getBucketItems, getEntries } from "@/lib/db";
import { hasKinds, type BucketItem, type Domain } from "@/lib/types";
import MapView from "./MapView";
import Nav from "./Nav";

// The map page for one half of the book. Both / and /activities are this
// with a different domain.
export default async function DiaryMap({ domain }: { domain: Domain }) {
  // The bucket list is only fetched for the half whose map is built around
  // finishing it. The food map has a category bar in that space instead, so
  // there is nothing there to feed.
  const [entries, items] = await Promise.all([
    getEntries(domain),
    hasKinds(domain) ? Promise.resolve([] as BucketItem[]) : getBucketItems(domain),
  ]);

  const todo = items.filter((i) => !i.entryId);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 relative animate-page-turn">
        <Nav active="map" floating domain={domain} />
        <MapView entries={entries} domain={domain} todo={todo} listTotal={items.length} />
      </div>
    </div>
  );
}
