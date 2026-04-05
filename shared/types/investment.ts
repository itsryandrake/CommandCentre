export type InvestmentStatus = "off_plan" | "under_construction" | "completed" | "settled";

export interface Investment {
  id: string;
  name: string;
  projectName?: string;
  tower?: string;
  unitNumber?: string;
  areaSqft?: number;
  areaSqm?: number;
  purchasePriceLocal?: number;
  purchasePriceAud?: number;
  currency: string;
  location?: string;
  country?: string;
  status: InvestmentStatus;
  completionDate?: string;
  description?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentPayment {
  id: string;
  investmentId: string;
  label: string;
  amountLocal: number;
  amountAud?: number;
  dateDue?: string;
  datePaid?: string;
  isPaid: boolean;
  percentage?: number;
  notes?: string;
  createdAt: string;
}

export interface InvestmentDocument {
  id: string;
  investmentId: string;
  name: string;
  fileUrl: string;
  fileType?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface InvestmentTask {
  id: string;
  investmentId: string;
  title: string;
  description?: string;
  dueDate?: string;
  isDone: boolean;
  createdAt: string;
}

export interface InvestmentWithDetails extends Investment {
  payments: InvestmentPayment[];
  documents: InvestmentDocument[];
  tasks: InvestmentTask[];
}

export interface CreateInvestmentInput {
  name: string;
  projectName?: string;
  tower?: string;
  unitNumber?: string;
  areaSqft?: number;
  areaSqm?: number;
  purchasePriceLocal?: number;
  purchasePriceAud?: number;
  currency?: string;
  location?: string;
  country?: string;
  status?: InvestmentStatus;
  completionDate?: string;
  description?: string;
  imageUrl?: string;
  notes?: string;
}

export type UpdateInvestmentInput = Partial<CreateInvestmentInput>;

export interface CreatePaymentInput {
  label: string;
  amountLocal: number;
  amountAud?: number;
  dateDue?: string;
  datePaid?: string;
  isPaid?: boolean;
  percentage?: number;
  notes?: string;
}

export interface CreateDocumentInput {
  name: string;
  fileUrl: string;
  fileType?: string;
  uploadedBy?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
}
