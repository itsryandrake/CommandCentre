import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Asset,
  Loan,
  CreateAssetInput,
  UpdateAssetInput,
  CreateLoanInput,
  UpdateLoanInput,
} from "@shared/types/finance";
import {
  fetchAssets,
  createAssetItem,
  updateAssetItem,
  deleteAssetItem,
  fetchLoans,
  createLoanItem,
  updateLoanItem,
  deleteLoanItem,
} from "@/lib/api";

export function useFinance() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [a, l] = await Promise.all([fetchAssets(), fetchLoans()]);
    setAssets(a);
    setLoans(l);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addAsset = async (input: CreateAssetInput) => {
    const item = await createAssetItem(input);
    if (item) await load();
    return item;
  };

  const editAsset = async (id: string, input: UpdateAssetInput) => {
    const item = await updateAssetItem(id, input);
    if (item) await load();
    return item;
  };

  const removeAsset = async (id: string) => {
    const success = await deleteAssetItem(id);
    if (success) await load();
    return success;
  };

  const addLoan = async (input: CreateLoanInput) => {
    const item = await createLoanItem(input);
    if (item) await load();
    return item;
  };

  const editLoan = async (id: string, input: UpdateLoanInput) => {
    const item = await updateLoanItem(id, input);
    if (item) await load();
    return item;
  };

  const removeLoan = async (id: string) => {
    const success = await deleteLoanItem(id);
    if (success) await load();
    return success;
  };

  const getLoansForAsset = (assetId: string) =>
    loans.filter((l) => l.assetId === assetId);

  const totalAssets = useMemo(
    () => assets.reduce((sum, a) => sum + (a.currentValue || 0), 0),
    [assets]
  );
  const totalOutstanding = useMemo(
    () => loans.reduce((sum, l) => sum + (l.currentBalance || 0), 0),
    [loans]
  );
  const totalMonthlyPayments = useMemo(
    () => loans.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0),
    [loans]
  );
  const netWorth = totalAssets - totalOutstanding;

  const assetsByType = useMemo(() => {
    const grouped: Record<string, Asset[]> = {};
    for (const asset of assets) {
      if (!grouped[asset.type]) grouped[asset.type] = [];
      grouped[asset.type].push(asset);
    }
    return grouped;
  }, [assets]);

  const loansByCategory = useMemo(() => {
    const loanItems = loans.filter((l) => l.type !== "other");
    const otherDebts = loans.filter((l) => l.type === "other");
    return { loans: loanItems, otherDebts };
  }, [loans]);

  return {
    assets,
    loans,
    isLoading,
    addAsset,
    editAsset,
    removeAsset,
    addLoan,
    editLoan,
    removeLoan,
    getLoansForAsset,
    totalAssets,
    totalOutstanding,
    totalMonthlyPayments,
    netWorth,
    assetsByType,
    loansByCategory,
    reload: load,
  };
}
