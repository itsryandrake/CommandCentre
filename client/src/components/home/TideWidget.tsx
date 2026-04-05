import { Waves, ArrowUp, ArrowDown } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import type { TideData } from "@shared/types/tides";

interface TideWidgetProps {
  tides: TideData | null;
  isLoading?: boolean;
}

export function TideWidget({ tides, isLoading }: TideWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Tides</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse text-muted-foreground">Loading tides...</div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (!tides || tides.extremes.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Tides</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-center">
            <Waves className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Tide data unavailable</p>
            <p className="text-xs opacity-70">API key may need configuration</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  // Find the next upcoming tide
  const now = new Date();
  const nextTideIndex = tides.extremes.findIndex(
    (e) => new Date(e.timestamp) > now
  );

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>{tides.station} Tides</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          {tides.extremes.slice(0, 6).map((extreme, i) => {
            const isNext = i === nextTideIndex;
            const isHigh = extreme.type === "High";

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  isNext
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isHigh ? (
                    <ArrowUp className="size-4 text-sage" />
                  ) : (
                    <ArrowDown className="size-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {extreme.type} Tide
                  </span>
                  {isNext && (
                    <span className="text-xs text-primary font-medium">Next</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {extreme.height}m
                  </span>
                  <span className="font-medium">{extreme.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
