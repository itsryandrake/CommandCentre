import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { HealthSummaryWidget } from "@/components/dashboard/HealthSummaryWidget";
import { WeatherWidget } from "@/components/home/WeatherWidget";
import { TideWidget } from "@/components/home/TideWidget";
import { CalendarWidget } from "@/components/home/CalendarWidget";
import { RemindersWidget } from "@/components/home/RemindersWidget";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { useHealth } from "@/hooks/useHealth";
import { useWeather } from "@/hooks/useWeather";
import { useTides } from "@/hooks/useTides";
import { useCalendar } from "@/hooks/useCalendar";
import { useReminders } from "@/hooks/useReminders";
import { Activity, Moon, Scale, Footprints } from "lucide-react";
import { Link } from "wouter";

function QuickStatCard({
  icon: Icon,
  label,
  value,
  unit,
  colour = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  unit?: string;
  colour?: string;
}) {
  return (
    <GlassCard>
      <GlassCardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold stat-number ${colour}`}>
              {value}
              {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

export function Home() {
  const { summary, isLoading: healthLoading } = useHealth();
  const { weather, isLoading: weatherLoading } = useWeather();
  const { tides, isLoading: tidesLoading } = useTides();
  const { events, isLoading: calendarLoading } = useCalendar();
  const { reminders, isLoading: remindersLoading, add, toggle, remove } = useReminders();

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Greeting + AI Search */}
        <DashboardGreeting />

        {/* Quick Health Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            icon={Activity}
            label="Recovery Score"
            value={summary?.whoop?.score ?? "--"}
            unit="%"
            colour={summary?.whoop?.score ? (summary.whoop.score >= 67 ? "text-sage" : summary.whoop.score >= 34 ? "text-amber-warm" : "text-destructive") : ""}
          />
          <QuickStatCard
            icon={Moon}
            label="Sleep Score"
            value={summary?.eightSleep?.sleepScore ?? "--"}
            unit="%"
            colour="text-primary"
          />
          <QuickStatCard
            icon={Scale}
            label="Weight"
            value={summary?.renpho?.weight?.toFixed(1) ?? "--"}
            unit="kg"
          />
          <QuickStatCard
            icon={Footprints}
            label="Steps"
            value={summary?.appleHealth?.steps?.toLocaleString() ?? "--"}
          />
        </div>

        {/* Weather + Tides */}
        <div className="grid gap-6 md:grid-cols-2">
          <WeatherWidget weather={weather} isLoading={weatherLoading} />
          <TideWidget tides={tides} isLoading={tidesLoading} />
        </div>

        {/* Calendar + Reminders */}
        <div className="grid gap-6 md:grid-cols-2">
          <CalendarWidget events={events} isLoading={calendarLoading} />
          <RemindersWidget
            reminders={reminders}
            isLoading={remindersLoading}
            onAdd={add}
            onToggle={toggle}
            onDelete={remove}
          />
        </div>

        {/* Health Detail + Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <HealthSummaryWidget summary={summary} isLoading={healthLoading} />

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Recent Activity</GlassCardTitle>
              <Link href="/health" className="text-xs text-primary hover:underline">
                View details
              </Link>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                {summary?.whoop && (
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Strain Today</span>
                    <span className="font-medium">{summary.whoop.strain.toFixed(1)}</span>
                  </div>
                )}
                {summary?.appleHealth && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">Active Calories</span>
                      <span className="font-medium">{summary.appleHealth.activeCalories} kcal</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">Exercise Minutes</span>
                      <span className="font-medium">{summary.appleHealth.exerciseMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Distance</span>
                      <span className="font-medium">{summary.appleHealth.distanceKm.toFixed(1)} km</span>
                    </div>
                  </>
                )}
                {!summary?.whoop && !summary?.appleHealth && (
                  <div className="flex items-center justify-center h-24 text-muted-foreground">
                    <p className="text-sm">No activity data available</p>
                  </div>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
