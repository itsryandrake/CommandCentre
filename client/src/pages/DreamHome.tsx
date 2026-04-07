import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DreamHomeGrid } from "@/components/dream-home/DreamHomeGrid";

export function DreamHome() {
  return (
    <DashboardLayout title="Dream Home">
      <DreamHomeGrid />
    </DashboardLayout>
  );
}
