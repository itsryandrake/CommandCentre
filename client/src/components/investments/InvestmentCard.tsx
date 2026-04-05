import type { Investment } from "@shared/types/investment";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Building2, MapPin } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  off_plan: "Off-Plan",
  under_construction: "Under Construction",
  completed: "Completed",
  settled: "Settled",
};

const STATUS_COLOURS: Record<string, string> = {
  off_plan: "bg-blue-100 text-blue-700",
  under_construction: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  settled: "bg-gray-100 text-gray-600",
};

interface InvestmentCardProps {
  investment: Investment & { totalPaidLocal?: number; totalPaidAud?: number };
  onClick?: () => void;
}

export function InvestmentCard({ investment, onClick }: InvestmentCardProps) {
  const totalLocal = investment.purchasePriceLocal || 0;
  const paidLocal = (investment as any).totalPaidLocal || 0;
  const paidAud = (investment as any).totalPaidAud || 0;
  const paidPct = totalLocal > 0 ? Math.round((paidLocal / totalLocal) * 100) : 0;

  return (
    <GlassCard className="cursor-pointer hover:bg-card/80 transition-colors" onClick={onClick}>
      <GlassCardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {investment.imageUrl ? (
                <img src={investment.imageUrl} alt={investment.name} className="size-12 rounded-lg object-cover" />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-6 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{investment.name}</h3>
                {investment.unitNumber && (
                  <p className="text-xs text-muted-foreground">Unit {investment.unitNumber}</p>
                )}
              </div>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOURS[investment.status] || STATUS_COLOURS.off_plan}`}>
              {STATUS_LABELS[investment.status] || investment.status}
            </span>
          </div>

          {(investment.location || investment.country) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" />
              {[investment.location, investment.country].filter(Boolean).join(", ")}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Purchase Price</p>
              <p className="font-mono font-medium">
                {investment.purchasePriceAud
                  ? `$${investment.purchasePriceAud.toLocaleString("en-AU")}`
                  : investment.purchasePriceLocal
                    ? `${investment.currency} ${investment.purchasePriceLocal.toLocaleString()}`
                    : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="font-mono font-medium text-green-600">
                {paidPct}%
                {paidAud > 0 && <span className="text-foreground ml-1">(${paidAud.toLocaleString("en-AU")})</span>}
              </p>
              {paidLocal > 0 && investment.currency !== "AUD" && (
                <p className="text-[10px] text-muted-foreground font-mono">{investment.currency} {paidLocal.toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPct}%` }} />
          </div>

          {investment.completionDate && (
            <p className="text-xs text-muted-foreground">Completion: {investment.completionDate}</p>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
