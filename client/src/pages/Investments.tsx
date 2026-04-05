import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useInvestments } from "@/hooks/useInvestment";
import { InvestmentCard } from "@/components/investments/InvestmentCard";
import { useLocation } from "wouter";
import { Plus, TrendingUp } from "lucide-react";

export function Investments() {
  const { investments, isLoading } = useInvestments();
  const [, navigate] = useLocation();

  // Calculate total paid per investment (we don't have payments at list level, so show card without paid %)
  return (
    <DashboardLayout title="Investments">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Investments</h1>
            <p className="text-muted-foreground">Track your property investments and payment schedules</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No investments tracked yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {investments.map((inv) => (
              <InvestmentCard
                key={inv.id}
                investment={inv}
                onClick={() => navigate(`/wealth/investments/${inv.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
