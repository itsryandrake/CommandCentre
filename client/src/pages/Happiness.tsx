import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Smile, Plane, Mountain, Palette } from "lucide-react";

export function Happiness() {
  return (
    <DashboardLayout title="Happiness">
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-normal">Happiness</h1>
          <p className="text-muted-foreground">
            Travel, adventure, and play — coming soon.
          </p>
        </div>

        <GlassCard>
          <GlassCardContent className="py-16">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex items-center gap-4">
                <Plane className="size-8 text-primary" />
                <Mountain className="size-8 text-sage" />
                <Palette className="size-8 text-amber-warm" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-semibold">
                  This space is being built
                </h2>
                <p className="text-muted-foreground">
                  Track trips and travel plans, log adventures, plan date
                  nights, and capture the things that bring you joy.
                </p>
              </div>
              <Smile className="size-12 text-primary/20" />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
