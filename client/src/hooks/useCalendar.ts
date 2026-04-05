import { useState, useEffect, useCallback } from "react";
import type { CalendarEvent } from "@shared/types/calendar";
import { fetchCalendarEvents } from "@/lib/api";

interface UseCalendarReturn {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCalendar(refreshInterval: number = 300000): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCalendarEvents();
      setEvents(data?.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch calendar");
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

  return { events, isLoading, error, refresh };
}
