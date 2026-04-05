import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DirtyToast } from "./DirtyToast";

interface SanctuaryLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function SanctuaryLayout({ children, title = "The Sanctuary" }: SanctuaryLayoutProps) {
  return (
    <DashboardLayout title={title}>
      {children}
      <DirtyToast />
    </DashboardLayout>
  );
}
