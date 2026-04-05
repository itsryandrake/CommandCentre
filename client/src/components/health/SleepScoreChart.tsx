import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Moon, Loader2 } from "lucide-react";
import type { HealthDateFilter, SleepScoreDataPoint } from "@shared/types/health";

interface SleepScoreChartProps {
  filter: HealthDateFilter;
}

const chartConfig = {
  sleepScore: { label: "Sleep Score", color: "hsl(var(--chart-1))" },
  hrvAvg: { label: "HRV", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function SleepScoreChart({ filter }: SleepScoreChartProps) {
  const [data, setData] = useState<SleepScoreDataPoint[]>([]);
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

        const response = await fetch(`/api/health/eightsleep/history?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const result = await response.json() as { history: SleepScoreDataPoint[] };
        setData(result.history || []);
      } catch (err) {
        console.error("Failed to fetch sleep history:", err);
        setError("Failed to load sleep data");
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
            <Moon className="size-5" />
            Sleep Score Trend
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
            <Moon className="size-5" />
            Sleep Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
            <Moon className="size-12 mb-2 opacity-50" />
            <p className="text-sm">{error || "No sleep data available"}</p>
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
          <Moon className="size-5" />
          Sleep Score Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
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
              <Line
                type="monotone"
                dataKey="sleepScore"
                stroke="var(--color-sleepScore)"
                strokeWidth={2}
                dot={{ fill: "var(--color-sleepScore)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
