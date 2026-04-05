import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, BarChart, Bar } from "recharts";
import {
  Heart,
  Activity,
  Moon,
  Scale,
  Footprints,
  RefreshCw,
  Zap,
  Thermometer,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { useHealth } from "@/hooks/useHealth";
import { useWhoop } from "@/hooks/useWhoop";
import { useEightSleep } from "@/hooks/useEightSleep";
import { useRenpho } from "@/hooks/useRenpho";
import { useAppleHealth } from "@/hooks/useAppleHealth";
import { getRecoveryLevel, getStrainDescription, type HealthDateFilter as FilterType, type AppleHealthData } from "@shared/types/health";
import { cn } from "@/lib/utils";
import {
  HealthDateFilter,
  SleepScoreChart,
  WeightChart,
  BodyCompositionChart,
} from "@/components/health";

const chartConfig = {
  recovery: { label: "Recovery", color: "var(--chart-1)" },
  hrv: { label: "HRV", color: "var(--chart-2)" },
  strain: { label: "Strain", color: "var(--chart-3)" },
  weight: { label: "Weight", color: "var(--chart-4)" },
  steps: { label: "Steps", color: "var(--chart-5)" },
  sleep: { label: "Sleep", color: "var(--chart-1)" },
} satisfies ChartConfig;

function RecoveryCard({ recovery, sleep, history, isLoading }: {
  recovery: ReturnType<typeof useWhoop>["recovery"];
  sleep: ReturnType<typeof useWhoop>["sleep"];
  history: ReturnType<typeof useWhoop>["history"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center animate-pulse text-muted-foreground">
            Loading Whoop data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recovery) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Recovery
          </CardTitle>
          <CardAction>
            <a
              href="/api/health/whoop/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Connect Whoop <ExternalLink className="size-3" />
            </a>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="size-12 mb-2 opacity-50" />
            <p className="text-sm">Whoop not connected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const level = getRecoveryLevel(recovery.score);
  const colours = {
    green: "text-sage",
    yellow: "text-amber-warm",
    red: "text-destructive",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          Recovery
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          {getStrainDescription(recovery.strain)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-5xl font-bold stat-number ${colours[level]}`}>{recovery.score}%</div>
            <p className="text-sm text-muted-foreground">Recovery Score</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2">
              <Heart className="size-4 text-destructive" />
              <span className="text-sm">{recovery.restingHeartRate} bpm</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Brain className="size-4 text-primary" />
              <span className="text-sm">{recovery.hrvMs} ms HRV</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Zap className="size-4 text-amber-warm" />
              <span className="text-sm">{recovery.strain.toFixed(1)} strain</span>
            </div>
          </div>
        </div>

        {/* Sleep Summary */}
        {sleep && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Last Night's Sleep</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {Math.floor(sleep.totalDuration / 60)}h {sleep.totalDuration % 60}m
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{sleep.deepDuration}m</div>
                <div className="text-xs text-muted-foreground">Deep</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{sleep.remDuration}m</div>
                <div className="text-xs text-muted-foreground">REM</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{sleep.sleepEfficiency}%</div>
                <div className="text-xs text-muted-foreground">Efficiency</div>
              </div>
            </div>
          </div>
        )}

        {/* History Chart */}
        {history.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">7-Day Recovery Trend</p>
            <ChartContainer config={chartConfig} className="h-[100px] w-full">
              <LineChart data={history}>
                <Line
                  type="monotone"
                  dataKey="recoveryScore"
                  stroke="var(--color-recovery)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SleepCard({ sleepData, deviceStatus, isLoading }: {
  sleepData: ReturnType<typeof useEightSleep>["sleepData"];
  deviceStatus: ReturnType<typeof useEightSleep>["deviceStatus"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="size-5" />
            Eight Sleep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center animate-pulse text-muted-foreground">
            Loading Eight Sleep data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sleepData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="size-5" />
            Eight Sleep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Moon className="size-12 mb-2 opacity-50" />
            <p className="text-sm">Eight Sleep not connected</p>
            <p className="text-xs mt-1">Add credentials in .env</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="size-5" />
          Eight Sleep
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold stat-number text-primary">{sleepData.sleepScore}%</div>
            <p className="text-sm text-muted-foreground">Sleep Fitness Score</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2">
              <Moon className="size-4 text-primary" />
              <span className="text-sm">
                {Math.floor(sleepData.sleepDuration / 60)}h {sleepData.sleepDuration % 60}m
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Heart className="size-4 text-destructive" />
              <span className="text-sm">{sleepData.heartRate} bpm avg</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Brain className="size-4 text-primary" />
              <span className="text-sm">{sleepData.hrvAvg} ms HRV</span>
            </div>
          </div>
        </div>

        {/* Sleep Details */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{sleepData.tossTurnCount}</div>
            <div className="text-xs text-muted-foreground">Toss & Turn</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{sleepData.respiratoryRate.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Breaths/min</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{sleepData.awakeTime}m</div>
            <div className="text-xs text-muted-foreground">Awake</div>
          </div>
        </div>

        {/* Device Status */}
        {deviceStatus && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Pod Temperature</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="size-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    {deviceStatus.leftSide.currentTemp}°C
                    {deviceStatus.leftSide.isOn && (
                      <span className="text-xs text-muted-foreground ml-1">
                        → {deviceStatus.leftSide.targetTemp}°C
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Left Side</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="size-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    {deviceStatus.rightSide.currentTemp}°C
                    {deviceStatus.rightSide.isOn && (
                      <span className="text-xs text-muted-foreground ml-1">
                        → {deviceStatus.rightSide.targetTemp}°C
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Right Side</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BodyCompositionCard({ appleHealthData, isLoading }: {
  appleHealthData: AppleHealthData | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="size-5" />
            Body Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center animate-pulse text-muted-foreground">
            Loading body composition...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have body composition data from Apple Health
  const hasBodyComp = appleHealthData?.weightKg;

  if (!hasBodyComp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="size-5" />
            Body Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Scale className="size-12 mb-2 opacity-50" />
            <p className="text-sm">No body composition data</p>
            <p className="text-xs mt-1">Set up Health Auto Export to sync Renpho → Apple Health → CommandCentre</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weight = appleHealthData.weightKg!;
  const bmi = appleHealthData.bmi;
  const bodyFat = appleHealthData.bodyFatPercent;
  const leanMass = appleHealthData.leanBodyMassKg;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-5" />
          Body Composition
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          {new Date(appleHealthData.date).toLocaleDateString("en-AU")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold stat-number">{weight.toFixed(1)}</span>
              <span className="text-xl text-muted-foreground">kg</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              via Apple Health
            </p>
          </div>
          {bmi && (
            <div className="text-right">
              <div className="text-sm">
                <span className="text-muted-foreground">BMI: </span>
                <span className="font-medium">{bmi.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Body Composition Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {bodyFat && (
            <div className="text-center">
              <div className="text-lg font-semibold">{bodyFat.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Body Fat</div>
            </div>
          )}
          {leanMass && (
            <div className="text-center">
              <div className="text-lg font-semibold">{leanMass.toFixed(1)} kg</div>
              <div className="text-xs text-muted-foreground">Lean Body Mass</div>
            </div>
          )}
        </div>

        {/* Note about additional metrics */}
        {(!bodyFat || !leanMass) && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Enable more metrics in Health Auto Export for body fat % and lean mass
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCard({ data, history, summary, isLoading }: {
  data: ReturnType<typeof useAppleHealth>["data"];
  history: ReturnType<typeof useAppleHealth>["history"];
  summary: ReturnType<typeof useAppleHealth>["summary"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Footprints className="size-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center animate-pulse text-muted-foreground">
            Loading Apple Health data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.steps === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Footprints className="size-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Footprints className="size-12 mb-2 opacity-50" />
            <p className="text-sm">No activity data</p>
            <p className="text-xs mt-1">Configure Health Auto Export app</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stepGoal = 10000;
  const stepProgress = Math.min((data.steps / stepGoal) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="size-5" />
          Activity
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          Today
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-4xl font-bold stat-number">{data.steps.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">steps</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold stat-number text-amber-warm">{data.activeCalories}</div>
              <p className="text-sm text-muted-foreground">active kcal</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-all"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{Math.round(stepProgress)}% of daily goal</p>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{data.exerciseMinutes}</div>
            <div className="text-xs text-muted-foreground">Exercise mins</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{data.standHours}</div>
            <div className="text-xs text-muted-foreground">Stand hours</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{data.distanceKm.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Distance km</div>
          </div>
        </div>

        {/* Weekly Summary */}
        {summary && summary.daysTracked > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">7-Day Average</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{summary.avgSteps.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Avg Steps</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{summary.totalExercise}</div>
                <div className="text-xs text-muted-foreground">Total Exercise</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{summary.avgSleep}h</div>
                <div className="text-xs text-muted-foreground">Avg Sleep</div>
              </div>
            </div>
          </div>
        )}

        {/* Steps History Chart */}
        {history.length > 1 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Steps This Week</p>
            <ChartContainer config={chartConfig} className="h-[100px] w-full">
              <BarChart data={history}>
                <Bar dataKey="steps" fill="var(--color-steps)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionStatus({ status }: { status: ReturnType<typeof useHealth>["status"] }) {
  if (!status) return null;

  const services = [
    { key: "whoop", name: "Whoop", icon: Activity, ...status.whoop },
    { key: "eightSleep", name: "Eight Sleep", icon: Moon, ...status.eightSleep },
    { key: "renpho", name: "Renpho", icon: Scale, ...status.renpho },
    { key: "appleHealth", name: "Apple Health", icon: Footprints, ...status.appleHealth },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5" />
          Service Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.key}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border",
                service.connected
                  ? "border-sage/30 bg-sage/5"
                  : service.configured
                    ? "border-amber-warm/30 bg-amber-warm/5"
                    : "border-border"
              )}
            >
              <service.icon className={cn(
                "size-5",
                service.connected
                  ? "text-sage"
                  : service.configured
                    ? "text-amber-warm"
                    : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {service.connected
                    ? "Connected"
                    : service.configured
                      ? "Configured"
                      : "Not configured"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Health() {
  const { status, isLoading: statusLoading, refresh } = useHealth();
  const whoop = useWhoop();
  const eightSleep = useEightSleep();
  const renpho = useRenpho();
  const appleHealth = useAppleHealth();

  // Date filter for historical charts
  const [dateFilter, setDateFilter] = useState<FilterType>({ type: "days", days: 30 });

  const handleRefresh = () => {
    refresh();
    whoop.refresh();
    eightSleep.refresh();
    renpho.refresh();
    appleHealth.refresh();
  };

  const isLoading = statusLoading || whoop.isLoading || eightSleep.isLoading || renpho.isLoading || appleHealth.isLoading;

  return (
    <DashboardLayout title="Health">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Health & Wellness</h2>
            <p className="text-sm text-muted-foreground">
              Track your recovery, sleep, body composition, and activity
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Connection Status */}
        <ConnectionStatus status={status} />

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecoveryCard
            recovery={whoop.recovery}
            sleep={whoop.sleep}
            history={whoop.history}
            isLoading={whoop.isLoading}
          />
          <SleepCard
            sleepData={eightSleep.sleepData}
            deviceStatus={eightSleep.deviceStatus}
            isLoading={eightSleep.isLoading}
          />
          <BodyCompositionCard
            appleHealthData={appleHealth.data}
            isLoading={appleHealth.isLoading}
          />
          <ActivityCard
            data={appleHealth.data}
            history={appleHealth.history}
            summary={appleHealth.summary}
            isLoading={appleHealth.isLoading}
          />
        </div>

        {/* Historical Charts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              <h3 className="text-lg font-semibold">Historical Trends</h3>
            </div>
            <HealthDateFilter
              value={dateFilter}
              onChange={setDateFilter}
              presets={["7d", "30d", "90d"]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SleepScoreChart filter={dateFilter} />
            <WeightChart filter={dateFilter} />
          </div>

          <BodyCompositionChart filter={dateFilter} />
        </div>
      </div>
    </DashboardLayout>
  );
}
