import { useState, useEffect, useCallback } from "react";
import type { Reminder, CreateReminderInput } from "@shared/types/reminder";
import {
  fetchReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
} from "@/lib/api";

interface UseRemindersReturn {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (input: CreateReminderInput) => Promise<Reminder | null>;
  toggle: (id: number, completed: boolean) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export function useReminders(): UseRemindersReturn {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchReminders();
      setReminders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reminders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (input: CreateReminderInput) => {
    const reminder = await createReminder(input);
    if (reminder) {
      setReminders((prev) => [reminder, ...prev]);
    }
    return reminder;
  }, []);

  const toggle = useCallback(async (id: number, completed: boolean) => {
    const updated = await toggleReminder(id, completed);
    if (updated) {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    const success = await deleteReminder(id);
    if (success) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  }, []);

  return { reminders, isLoading, error, refresh, add, toggle, remove };
}
