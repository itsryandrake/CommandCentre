import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WishlistTable } from "@/components/dream-home-wishlist/WishlistTable";

export function DreamHomeWishlist() {
  return (
    <DashboardLayout title="Dream Home Wishlist">
      <WishlistTable />
    </DashboardLayout>
  );
}
