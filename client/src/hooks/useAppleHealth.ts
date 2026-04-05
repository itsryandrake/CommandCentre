import { useState, useEffect, useCallback } from "react";
import type { AppleHealthData } from "@shared/types/health";
import { fetchAppleHealthData, fetchAppleHealthHistory } from "@/lib/api";

interface UseAppleHealthReturn {
  data: AppleHealthData | null;
  history: AppleHealthData[];
  summary: {
    totalSteps: number;
    avgSteps: number;
    totalExercise: number;
    avgSleep: number;
    daysTracked: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAppleHealth(refreshInterval: number = 300000): UseAppleHealthReturn {
  const [data, setData] = useState<AppleHealthData | null>(null);
  const [history, setHistory] = useState<AppleHealthData[]>([]);
  const [summary, setSummary] = useState<UseAppleHealthReturn["summary"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [latestData, historyData] = await Promise.all([
        fetchAppleHealthData(),
        fetchAppleHealthHistory(7),
      ]);

      setData(latestData);
      setHistory(historyData.history);
      setSummary(historyData.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch Apple Health data";
      setError(message);
      console.error("[AppleHealth] Fetch error:", err);
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
    history,
    summary,
    isLoading,
    error,
    refresh: fetchData,
  };
}
