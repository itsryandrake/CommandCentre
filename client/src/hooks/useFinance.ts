import { useState, useEffect, useCallback } from "react";
import type {
  Property,
  Loan,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateLoanInput,
  UpdateLoanInput,
} from "@shared/types/finance";
import {
  fetchProperties,
  createPropertyItem,
  updatePropertyItem,
  fetchLoans,
  createLoanItem,
  updateLoanItem,
  deleteLoanItem,
} from "@/lib/api";

export function useFinance() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [props, lns] = await Promise.all([fetchProperties(), fetchLoans()]);
    setProperties(props);
    setLoans(lns);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProperty = async (input: CreatePropertyInput) => {
    const item = await createPropertyItem(input);
    if (item) await load();
    return item;
  };

  const editProperty = async (id: string, input: UpdatePropertyInput) => {
    const item = await updatePropertyItem(id, input);
    if (item) await load();
    return item;
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

  const getLoansForProperty = (propertyId: string) =>
    loans.filter((l) => l.propertyId === propertyId);

  const totalOutstanding = loans.reduce((sum, l) => sum + (l.currentBalance || 0), 0);
  const totalMonthlyPayments = loans.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);

  return {
    properties,
    loans,
    isLoading,
    addProperty,
    editProperty,
    addLoan,
    editLoan,
    removeLoan,
    getLoansForProperty,
    totalOutstanding,
    totalMonthlyPayments,
    reload: load,
  };
}
