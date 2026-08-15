import { getEntries } from "@/lib/db";
import { type Domain } from "@/lib/types";
import BookFlip from "./BookFlip";
import MapView from "./MapView";
import Nav from "./Nav";

// The map page for one half of the book. Both / and /activities are this
// with a different domain.
//
// BookFlip is a sibling of the animated wrapper, not a child: .animate-page-turn
// sets a transform, and a transformed ancestor becomes the containing block
// for position:fixed descendants, which would peg the tab to this box for
// the length of the animation and then snap it back to the viewport.
export default async function DiaryMap({ domain }: { domain: Domain }) {
  const entries = await getEntries(domain);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <BookFlip from={domain} />
      <div className="flex-1 min-h-0 relative animate-page-turn">
        <Nav active="map" floating domain={domain} />
        <MapView entries={entries} domain={domain} />
      </div>
    </div>
  );
}
