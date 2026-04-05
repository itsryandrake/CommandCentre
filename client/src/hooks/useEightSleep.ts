import { useState, useEffect, useCallback } from "react";
import type { EightSleepData, EightSleepDeviceStatus } from "@shared/types/health";
import { fetchEightSleepData, fetchEightSleepStatus } from "@/lib/api";

interface UseEightSleepReturn {
  sleepData: EightSleepData | null;
  deviceStatus: EightSleepDeviceStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEightSleep(refreshInterval: number = 600000): UseEightSleepReturn {
  const [sleepData, setSleepData] = useState<EightSleepData | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<EightSleepDeviceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sleep, status] = await Promise.all([
        fetchEightSleepData(),
        fetchEightSleepStatus(),
      ]);

      setSleepData(sleep);
      setDeviceStatus(status);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch Eight Sleep data";
      setError(message);
      console.error("[EightSleep] Fetch error:", err);
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
    sleepData,
    deviceStatus,
    isLoading,
    error,
    refresh: fetchData,
  };
}
