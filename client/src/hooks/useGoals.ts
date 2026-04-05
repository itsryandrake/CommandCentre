import { useState, useEffect, useCallback } from "react";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "@shared/types/goal";
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/api";

interface UseGoalsReturn {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (input: CreateGoalInput) => Promise<Goal | null>;
  update: (id: number, input: UpdateGoalInput) => Promise<Goal | null>;
  remove: (id: number) => Promise<void>;
}

export function useGoals(year?: number): UseGoalsReturn {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchGoals(year);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch goals");
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (input: CreateGoalInput) => {
    const goal = await createGoal(input);
    if (goal) {
      setGoals((prev) => [goal, ...prev]);
    }
    return goal;
  }, []);

  const update = useCallback(async (id: number, input: UpdateGoalInput) => {
    const updated = await updateGoal(id, input);
    if (updated) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? updated : g))
      );
    }
    return updated;
  }, []);

  const remove = useCallback(async (id: number) => {
    const success = await deleteGoal(id);
    if (success) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  }, []);

  return { goals, isLoading, error, refresh, add, update, remove };
}
