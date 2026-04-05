import { useState, useEffect, useCallback } from "react";
import type { HealthSummary } from "@shared/types/health";
import { fetchHealthSummary, fetchHealthStatus } from "@/lib/api";

interface HealthStatus {
  whoop: { configured: boolean; connected: boolean; authUrl?: string | null };
  eightSleep: { configured: boolean; connected: boolean };
  renpho: { configured: boolean; connected: boolean };
  appleHealth: { configured: boolean; connected: boolean; webhookUrl: string };
}

interface UseHealthReturn {
  summary: HealthSummary | null;
  status: HealthStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasAnyData: boolean;
}

export function useHealth(refreshInterval: number = 300000): UseHealthReturn {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryData, statusData] = await Promise.all([
        fetchHealthSummary(),
        fetchHealthStatus(),
      ]);

      setSummary(summaryData);
      setStatus(statusData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch health data";
      setError(message);
      console.error("[Health] Fetch error:", err);
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

  const hasAnyData = !!(
    summary?.whoop ||
    summary?.eightSleep ||
    summary?.renpho ||
    summary?.appleHealth
  );

  return {
    summary,
    status,
    isLoading,
    error,
    refresh: fetchData,
    hasAnyData,
  };
}

// Individual service hooks for more granular control
export { useWhoop } from "./useWhoop";
export { useEightSleep } from "./useEightSleep";
export { useRenpho } from "./useRenpho";
export { useAppleHealth } from "./useAppleHealth";
