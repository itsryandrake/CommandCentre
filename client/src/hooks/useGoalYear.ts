import { useState, useEffect, useCallback } from "react";
import type { GoalYear, GoalYearIntention, UpdateGoalYearInput } from "@shared/types/goal";
import {
  fetchGoalYears,
  fetchGoalYear,
  upsertGoalYear,
  fetchGoalIntentions,
  upsertGoalIntention,
} from "@/lib/api";

interface UseGoalYearReturn {
  yearData: GoalYear | null;
  intentions: GoalYearIntention[];
  availableYears: number[];
  isLoading: boolean;
  updateYear: (input: UpdateGoalYearInput) => Promise<void>;
  updateIntention: (category: string, intention: string) => Promise<void>;
}

export function useGoalYear(year: number): UseGoalYearReturn {
  const [yearData, setYearData] = useState<GoalYear | null>(null);
  const [intentions, setIntentions] = useState<GoalYearIntention[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([year]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const [yd, ints, years] = await Promise.all([
        fetchGoalYear(year),
        fetchGoalIntentions(year),
        fetchGoalYears(),
      ]);
      if (!cancelled) {
        setYearData(yd);
        setIntentions(ints);
        setAvailableYears(years);
        setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [year]);

  const updateYear = useCallback(async (input: UpdateGoalYearInput) => {
    const updated = await upsertGoalYear(year, input);
    if (updated) setYearData(updated);
  }, [year]);

  const updateIntention = useCallback(async (category: string, intention: string) => {
    const updated = await upsertGoalIntention(year, category, intention);
    if (updated) {
      setIntentions((prev) => {
        const idx = prev.findIndex((i) => i.category === category);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    }
  }, [year]);

  return { yearData, intentions, availableYears, isLoading, updateYear, updateIntention };
}
