import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Scale, Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { HealthDateFilter, WeightDataPoint } from "@shared/types/health";

interface WeightChartProps {
  filter: HealthDateFilter;
}

const chartConfig = {
  weight: { label: "Weight (kg)", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

interface TrendResponse {
  trend: { date: string; weight: number; bodyFatPercent: number }[];
  summary: {
    startWeight: number;
    currentWeight: number;
    weightChange: number;
    bodyFatChange: number;
    measurementCount: number;
  } | null;
}

export function WeightChart({ filter }: WeightChartProps) {
  const [data, setData] = useState<WeightDataPoint[]>([]);
  const [summary, setSummary] = useState<TrendResponse["summary"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
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
        const result = await response.json() as TrendResponse;

        // Convert to WeightDataPoint and calculate change
        const weightData: WeightDataPoint[] = (result.trend || []).map((d, i, arr) => ({
          date: d.date,
          weight: d.weight,
          change: i > 0 ? Math.round((d.weight - arr[i - 1].weight) * 100) / 100 : 0,
        }));

        setData(weightData);
        setSummary(result.summary);
      } catch (err) {
        console.error("Failed to fetch weight trend:", err);
        setError("Failed to load weight data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [filter]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="size-5" />
            Weight Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
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
            <Scale className="size-5" />
            Weight Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
            <Scale className="size-12 mb-2 opacity-50" />
            <p className="text-sm">{error || "No weight data available"}</p>
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

  // Calculate Y-axis domain with padding
  const weights = data.map((d) => d.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  // Trend indicator
  const trendIcon = summary?.weightChange
    ? summary.weightChange > 0
      ? <TrendingUp className="size-4 text-amber-warm" />
      : <TrendingDown className="size-4 text-sage" />
    : <Minus className="size-4 text-muted-foreground" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-5" />
          Weight Trend
        </CardTitle>
        {summary && summary.weightChange !== 0 && (
          <div className="flex items-center gap-1 text-sm">
            {trendIcon}
            <span className={summary.weightChange > 0 ? "text-amber-warm" : "text-sage"}>
              {summary.weightChange > 0 ? "+" : ""}{summary.weightChange.toFixed(1)} kg
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[minWeight, maxWeight]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                tickFormatter={(value) => `${value}kg`}
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
              <Area
                type="monotone"
                dataKey="weight"
                stroke="var(--color-weight)"
                fill="var(--color-weight)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
