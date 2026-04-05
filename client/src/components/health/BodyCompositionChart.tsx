import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthDateFilter, BodyCompositionMetric, RenphoTrendExtended } from "@shared/types/health";

interface BodyCompositionChartProps {
  filter: HealthDateFilter;
}

const METRICS: { key: BodyCompositionMetric; label: string; color: string; unit: string }[] = [
  { key: "weight", label: "Weight", color: "hsl(var(--chart-1))", unit: "kg" },
  { key: "bodyFatPercent", label: "Body Fat", color: "hsl(var(--chart-2))", unit: "%" },
  { key: "muscleMass", label: "Muscle", color: "hsl(var(--chart-3))", unit: "kg" },
  { key: "waterPercent", label: "Water", color: "hsl(var(--chart-4))", unit: "%" },
  { key: "boneMass", label: "Bone", color: "hsl(var(--chart-5))", unit: "kg" },
  { key: "visceralFat", label: "Visceral Fat", color: "hsl(200, 70%, 50%)", unit: "" },
  { key: "bmi", label: "BMI", color: "hsl(280, 70%, 50%)", unit: "" },
];

const chartConfig: ChartConfig = METRICS.reduce((acc, metric) => {
  acc[metric.key] = { label: metric.label, color: metric.color };
  return acc;
}, {} as ChartConfig);

export function BodyCompositionChart({ filter }: BodyCompositionChartProps) {
  const [data, setData] = useState<RenphoTrendExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabledMetrics, setEnabledMetrics] = useState<Set<BodyCompositionMetric>>(
    () => new Set<BodyCompositionMetric>(["weight", "bodyFatPercent"])
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("extended", "true");
        if (filter.type === "days" && filter.days) {
          params.set("days", filter.days.toString());
        } else if (filter.type === "range" && filter.startDate && filter.endDate) {
          params.set("startDate", filter.startDate);
          params.set("endDate", filter.endDate);
        }

        const response = await fetch(`/api/health/renpho/trend?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const result = await response.json() as { trend: RenphoTrendExtended[] };
        setData(result.trend || []);
      } catch (err) {
        console.error("Failed to fetch body composition data:", err);
        setError("Failed to load body composition data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [filter]);

  const toggleMetric = (metric: BodyCompositionMetric) => {
    setEnabledMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(metric)) {
        // Don't allow removing the last metric
        if (next.size > 1) {
          next.delete(metric);
        }
      } else {
        next.add(metric);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Body Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Body Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="size-12 mb-2 opacity-50" />
            <p className="text-sm">{error || "No body composition data available"}</p>
            <p className="text-xs mt-1">Data will appear after syncing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          Body Composition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metric Toggle Buttons */}
        <div className="flex flex-wrap gap-2">
          {METRICS.map((metric) => {
            const isEnabled = enabledMetrics.has(metric.key);
            return (
              <Button
                key={metric.key}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs transition-all",
                  isEnabled && "ring-2 ring-offset-1 ring-current"
                )}
                style={{
                  borderColor: isEnabled ? metric.color : undefined,
                  color: isEnabled ? metric.color : undefined,
                }}
                onClick={() => toggleMetric(metric.key)}
              >
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: metric.color }}
                />
                {metric.label}
              </Button>
            );
          })}
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.date;
                      }
                      return "";
                    }}
                  />
                }
              />
              {METRICS.filter((m) => enabledMetrics.has(m.key)).map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
