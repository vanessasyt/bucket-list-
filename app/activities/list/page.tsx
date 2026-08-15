import WishlistPage from "../../components/WishlistPage";

export const dynamic = "force-dynamic";

export default async function ActivitiesListPage() {
  return <WishlistPage domain="activity" />;
}
