import DiaryMap from "./components/DiaryMap";

export const dynamic = "force-dynamic";

// Food keeps the root: it's what's bookmarked, and a redirect on the
// homepage of a live app would be a real cost for a cosmetic gain.
export default async function MapPage() {
  return <DiaryMap domain="food" />;
}
