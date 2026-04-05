import { useState, useEffect, useCallback } from "react";
import type { Investment, InvestmentWithDetails } from "@shared/types/investment";
import { fetchInvestments, fetchInvestmentDetail } from "@/lib/api";

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setInvestments(await fetchInvestments());
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { investments, isLoading, reload: load };
}

export function useInvestmentDetail(id: string | undefined) {
  const [investment, setInvestment] = useState<InvestmentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setInvestment(await fetchInvestmentDetail(id));
    setIsLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  return { investment, isLoading, reload: load };
}
