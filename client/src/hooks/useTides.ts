import { useState, useEffect, useCallback } from "react";
import type { TideData } from "@shared/types/tides";
import { fetchTides } from "@/lib/api";

interface UseTidesReturn {
  tides: TideData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTides(refreshInterval: number = 1800000): UseTidesReturn {
  const [tides, setTides] = useState<TideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTides();
      setTides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tides");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return { tides, isLoading, error, refresh };
}
