import WishlistPage from "../components/WishlistPage";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  return <WishlistPage domain="food" />;
}
