import { Heart, Activity, Moon, Scale, Footprints, Zap, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import type { HealthSummary } from "@shared/types/health";
import { getRecoveryLevel, getWeightTrend, getStrainDescription } from "@shared/types/health";
import { Link } from "wouter";

interface HealthSummaryWidgetProps {
  summary: HealthSummary | null;
  isLoading?: boolean;
}

function RecoveryIndicator({ score }: { score: number }) {
  const level = getRecoveryLevel(score);
  const colours = {
    green: "bg-sage",
    yellow: "bg-amber-warm",
    red: "bg-destructive",
  };
  const textColours = {
    green: "text-sage",
    yellow: "text-amber-warm",
    red: "text-destructive",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`size-3 rounded-full ${colours[level]}`} />
      <span className={`text-2xl font-bold stat-number ${textColours[level]}`}>{score}%</span>
    </div>
  );
}

function WeightTrendIcon({ current, previous }: { current: number; previous: number }) {
  const trend = getWeightTrend(current, previous);
  const icons = {
    up: <TrendingUp className="size-4 text-amber-warm" />,
    down: <TrendingDown className="size-4 text-sage" />,
    stable: <Minus className="size-4 text-muted-foreground" />,
  };
  return icons[trend];
}

function MetricRow({
  icon: Icon,
  label,
  value,
  unit,
  subtext,
  colour = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  colour?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-medium ${colour}`}>
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
        </span>
        {subtext && (
          <div className="text-xs text-muted-foreground">{subtext}</div>
        )}
      </div>
    </div>
  );
}

export function HealthSummaryWidget({ summary, isLoading }: HealthSummaryWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Health & Wellness</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading health data...</div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const hasAnyData = summary?.whoop || summary?.eightSleep || summary?.renpho || summary?.appleHealth;

  if (!hasAnyData) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Health & Wellness</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
            <Heart className="size-8 mb-2 opacity-50" />
            <p className="text-sm">No health services connected</p>
            <Link href="/health" className="text-xs text-primary hover:underline mt-2">
              Configure integrations
            </Link>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Health & Wellness</GlassCardTitle>
        <Link href="/health" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </GlassCardHeader>
      <GlassCardContent className="space-y-1">
        {/* Recovery Score from Whoop */}
        {summary?.whoop && (
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Recovery</span>
            </div>
            <div className="flex items-center gap-3">
              <RecoveryIndicator score={summary.whoop.score} />
              <div className="text-right text-xs text-muted-foreground">
                <div>HRV: {summary.whoop.hrvMs}ms</div>
                <div>Strain: {summary.whoop.strain.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Sleep from Eight Sleep or Whoop */}
        {(summary?.eightSleep || summary?.whoopSleep) && (
          <div className="py-2 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sleep</span>
              </div>
              <div className="text-right">
                {summary?.eightSleep ? (
                  <>
                    <span className="font-medium text-primary">{summary.eightSleep.sleepScore}%</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(summary.eightSleep.sleepDuration / 60)}h {summary.eightSleep.sleepDuration % 60}m
                    </div>
                  </>
                ) : summary?.whoopSleep ? (
                  <>
                    <span className="font-medium text-primary">
                      {Math.floor(summary.whoopSleep.qualityDuration / 60)}h {summary.whoopSleep.qualityDuration % 60}m
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {summary.whoopSleep.sleepEfficiency}% efficiency
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Weight from Renpho */}
        {summary?.renpho && (
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{summary.renpho.weight.toFixed(1)} kg</span>
              <div className="text-xs text-muted-foreground">
                BF: {summary.renpho.bodyFatPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Steps from Apple Health */}
        {summary?.appleHealth && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Footprints className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Steps</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{summary.appleHealth.steps.toLocaleString()}</span>
              {summary.appleHealth.exerciseMinutes > 0 && (
                <div className="text-xs text-muted-foreground">
                  {summary.appleHealth.exerciseMinutes} min exercise
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick stats row */}
        <div className="flex gap-3 pt-2 mt-2 border-t border-border/30">
          {summary?.whoop && (
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">RHR</div>
              <div className="font-medium text-sm">{summary.whoop.restingHeartRate}</div>
            </div>
          )}
          {summary?.appleHealth && (
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">Active</div>
              <div className="font-medium text-sm">{summary.appleHealth.activeCalories} kcal</div>
            </div>
          )}
          {summary?.eightSleep && (
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">Bed Temp</div>
              <div className="font-medium text-sm">{summary.eightSleep.bedTemperature}°C</div>
            </div>
          )}
          {summary?.renpho && (
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">BMI</div>
              <div className="font-medium text-sm">{summary.renpho.bmi.toFixed(1)}</div>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
