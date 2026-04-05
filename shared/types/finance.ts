export type PropertyType = "primary" | "investment" | "other";
export type LoanType = "mortgage" | "personal" | "car" | "other";

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address?: string;
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  propertyId?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyInput {
  name: string;
  type: PropertyType;
  address?: string;
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: string;
}

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export interface CreateLoanInput {
  propertyId?: string;
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
}

export type UpdateLoanInput = Partial<CreateLoanInput>;
