import type { Investment } from "@shared/types/investment";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Building2, Home, MapPin } from "lucide-react";

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

// Property type detection — extend as needed
const PROPERTY_TYPES: Record<string, { label: string; icon: typeof Building2 }> = {
  bearberry: { label: "House", icon: Home },
  "banksia beach": { label: "House", icon: Home },
  "sobha solis": { label: "Apartment", icon: Building2 },
};

function getPropertyType(name: string, location?: string) {
  const search = `${name} ${location || ""}`.toLowerCase();
  for (const [key, value] of Object.entries(PROPERTY_TYPES)) {
    if (search.includes(key)) return value;
  }
  return { label: "Property", icon: Building2 };
}

// Banksia Beach mortgage details (hardcoded — same source as detail page)
const BANKSIA_MORTGAGE = { approved: 458391, remaining: 412945.07 };

interface InvestmentCardProps {
  investment: Investment & { totalPaidLocal?: number; totalPaidAud?: number };
  onClick?: () => void;
}

export function InvestmentCard({ investment, onClick }: InvestmentCardProps) {
  const totalLocal = investment.purchasePriceLocal || 0;
  const paidLocal = (investment as any).totalPaidLocal || 0;
  const paidAud = (investment as any).totalPaidAud || 0;
  const paidPct = totalLocal > 0 ? Math.round((paidLocal / totalLocal) * 100) : 0;

  const isBanksiaBeach = investment.name.toLowerCase().includes("bearberry") || investment.location?.toLowerCase().includes("banksia beach");
  const mortgagePaidPct = isBanksiaBeach
    ? Math.round(((BANKSIA_MORTGAGE.approved - BANKSIA_MORTGAGE.remaining) / BANKSIA_MORTGAGE.approved) * 100)
    : 0;

  const propertyType = getPropertyType(investment.name, investment.location);
  const PropertyIcon = propertyType.icon;

  const mapsUrl = investment.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([investment.location, investment.country].filter(Boolean).join(", "))}`
    : null;

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
                  <PropertyIcon className="size-6 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{investment.name}</h3>
                {investment.unitNumber && (
                  <p className="text-xs text-muted-foreground">Unit {investment.unitNumber}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOURS[investment.status] || STATUS_COLOURS.off_plan}`}>
                {STATUS_LABELS[investment.status] || investment.status}
              </span>
              <span className="text-[10px] text-muted-foreground">{propertyType.label}</span>
            </div>
          </div>

          {(investment.location || investment.country) && (
            <a
              href={mapsUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="size-3" />
              {[investment.location, investment.country].filter(Boolean).join(", ")}
            </a>
          )}

          {isBanksiaBeach ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Mortgage</p>
                  <p className="font-mono font-medium">
                    ${BANKSIA_MORTGAGE.approved.toLocaleString("en-AU")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Repaid</p>
                  <p className="font-mono font-medium text-green-600">
                    {mortgagePaidPct}%
                    <span className="text-foreground ml-1">(${(BANKSIA_MORTGAGE.approved - BANKSIA_MORTGAGE.remaining).toLocaleString("en-AU", { maximumFractionDigits: 0 })})</span>
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${mortgagePaidPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Est. value: $1,400,000</p>
            </>
          ) : (
            <>
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
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPct}%` }} />
              </div>
              {investment.completionDate && (
                <p className="text-xs text-muted-foreground">Completion: {investment.completionDate}</p>
              )}
            </>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
