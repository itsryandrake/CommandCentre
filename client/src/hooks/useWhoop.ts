import { useState, useEffect, useCallback } from "react";
import type { WhoopRecovery, WhoopSleepData } from "@shared/types/health";
import { fetchWhoopRecovery, fetchWhoopSleep, fetchWhoopHistory, fetchWhoopStatus } from "@/lib/api";

interface UseWhoopReturn {
  recovery: WhoopRecovery | null;
  sleep: WhoopSleepData | null;
  history: Array<{
    date: string;
    recoveryScore: number;
    hrv: number;
    restingHr: number;
  }>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWhoop(refreshInterval: number = 300000): UseWhoopReturn {
  const [recovery, setRecovery] = useState<WhoopRecovery | null>(null);
  const [sleep, setSleep] = useState<WhoopSleepData | null>(null);
  const [history, setHistory] = useState<UseWhoopReturn["history"]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check connection status first
      const statusData = await fetchWhoopStatus();
      setIsConnected(statusData?.connected ?? false);

      if (!statusData?.connected) {
        setRecovery(null);
        setSleep(null);
        setHistory([]);
        return;
      }

      const [recoveryData, sleepData, historyData] = await Promise.all([
        fetchWhoopRecovery(),
        fetchWhoopSleep(),
        fetchWhoopHistory(7),
      ]);

      setRecovery(recoveryData);
      setSleep(sleepData);
      setHistory(historyData.history);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch Whoop data";
      setError(message);
      console.error("[Whoop] Fetch error:", err);
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
    recovery,
    sleep,
    history,
    isConnected,
    isLoading,
    error,
    refresh: fetchData,
  };
}
