import { useState, useEffect, useCallback } from "react";
import type { RenphoData, RenphoTrend } from "@shared/types/health";
import { fetchRenphoData, fetchRenphoTrend } from "@/lib/api";

interface UseRenphoReturn {
  data: RenphoData | null;
  trend: RenphoTrend[];
  summary: {
    startWeight: number;
    currentWeight: number;
    weightChange: number;
    bodyFatChange: number;
    measurementCount: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRenpho(refreshInterval: number = 3600000): UseRenphoReturn {
  const [data, setData] = useState<RenphoData | null>(null);
  const [trend, setTrend] = useState<RenphoTrend[]>([]);
  const [summary, setSummary] = useState<UseRenphoReturn["summary"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [latestData, trendData] = await Promise.all([
        fetchRenphoData(),
        fetchRenphoTrend(30),
      ]);

      setData(latestData);
      setTrend(trendData.trend);
      setSummary(trendData.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch Renpho data";
      setError(message);
      console.error("[Renpho] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    trend,
    summary,
    isLoading,
    error,
    refresh: fetchData,
  };
}
