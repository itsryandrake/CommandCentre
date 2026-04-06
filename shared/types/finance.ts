export type AssetType = "property" | "vehicle" | "investment" | "retirement_fund" | "bank" | "other";
export type LoanType = "mortgage" | "personal" | "car" | "other";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description?: string;
  address?: string;
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  assetId?: string;
  name: string;
  type: LoanType;
  lender?: string;
  originalAmount?: number;
  currentBalance?: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate?: string;
  endDate?: string;
  isFixedRate?: boolean;
  fixedRateExpiry?: string;
  notes?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  name: string;
  type: AssetType;
  description?: string;
  address?: string;
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: string;
  currency?: string;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;

export interface CreateLoanInput {
  assetId?: string;
  name: string;
  type: LoanType;
  lender?: string;
  originalAmount?: number;
  currentBalance?: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate?: string;
  endDate?: string;
  isFixedRate?: boolean;
  fixedRateExpiry?: string;
  notes?: string;
  currency?: string;
}

export type UpdateLoanInput = Partial<CreateLoanInput>;
