export const DOCUMENT_CATEGORIES = [
  "insurance",
  "tax",
  "utility",
  "warranty",
  "council",
  "vehicle",
  "medical",
  "financial",
  "other",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  insurance: "Insurance",
  tax: "Tax",
  utility: "Utility Bills",
  warranty: "Warranties",
  council: "Council / Rates",
  vehicle: "Vehicle",
  medical: "Medical",
  financial: "Financial",
  other: "Other",
};

export interface HouseholdDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number;
  storagePath: string;
  category: DocumentCategory;
  subcategory?: string;
  documentTitle?: string;
  provider?: string;
  policyNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  amount?: number;
  amountLabel?: string;
  keyDetails?: Record<string, string>;
  aiSummary?: string;
  equipmentId?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAnalysis {
  category: DocumentCategory;
  subcategory?: string;
  documentTitle?: string;
  provider?: string;
  policyNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  amount?: number;
  amountLabel?: string;
  keyDetails?: Record<string, string>;
  aiSummary?: string;
}

export interface CreateDocumentInput {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number;
  storagePath: string;
  category: DocumentCategory;
  subcategory?: string;
  documentTitle?: string;
  provider?: string;
  policyNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  amount?: number;
  amountLabel?: string;
  keyDetails?: Record<string, string>;
  aiSummary?: string;
  equipmentId?: string;
  uploadedBy?: string;
}

export type UpdateDocumentInput = Partial<Omit<CreateDocumentInput, "fileName" | "fileUrl" | "storagePath">>;
