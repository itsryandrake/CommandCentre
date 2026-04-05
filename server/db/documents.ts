import { getSupabase } from "./supabase.ts";
import type {
  HouseholdDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../../shared/types/document.ts";

function dbToDocument(row: any): HouseholdDocument {
  return {
    id: row.id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileType: row.file_type,
    fileSizeBytes: row.file_size_bytes ? Number(row.file_size_bytes) : undefined,
    storagePath: row.storage_path,
    category: row.category,
    subcategory: row.subcategory,
    documentTitle: row.document_title,
    provider: row.provider,
    policyNumber: row.policy_number,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    amount: row.amount ? Number(row.amount) : undefined,
    amountLabel: row.amount_label,
    keyDetails: row.key_details,
    aiSummary: row.ai_summary,
    equipmentId: row.equipment_id,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inputToDb(input: CreateDocumentInput | UpdateDocumentInput): any {
  const db: any = {};
  if ("fileName" in input && input.fileName !== undefined) db.file_name = input.fileName;
  if ("fileUrl" in input && input.fileUrl !== undefined) db.file_url = input.fileUrl;
  if ("fileType" in input && input.fileType !== undefined) db.file_type = input.fileType;
  if ("fileSizeBytes" in input && input.fileSizeBytes !== undefined) db.file_size_bytes = input.fileSizeBytes;
  if ("storagePath" in input && input.storagePath !== undefined) db.storage_path = input.storagePath;
  if (input.category !== undefined) db.category = input.category;
  if (input.subcategory !== undefined) db.subcategory = input.subcategory;
  if (input.documentTitle !== undefined) db.document_title = input.documentTitle;
  if (input.provider !== undefined) db.provider = input.provider;
  if (input.policyNumber !== undefined) db.policy_number = input.policyNumber;
  if (input.issueDate !== undefined) db.issue_date = input.issueDate;
  if (input.expiryDate !== undefined) db.expiry_date = input.expiryDate;
  if (input.amount !== undefined) db.amount = input.amount;
  if (input.amountLabel !== undefined) db.amount_label = input.amountLabel;
  if (input.keyDetails !== undefined) db.key_details = input.keyDetails;
  if (input.aiSummary !== undefined) db.ai_summary = input.aiSummary;
  if (input.equipmentId !== undefined) db.equipment_id = input.equipmentId;
  if (input.uploadedBy !== undefined) db.uploaded_by = input.uploadedBy;
  return db;
}

export async function listDocuments(category?: string): Promise<HouseholdDocument[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToDocument);
}

export async function getDocument(id: string): Promise<HouseholdDocument | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return dbToDocument(data);
}

export async function createDocument(input: CreateDocumentInput): Promise<HouseholdDocument> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("documents")
    .insert(inputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToDocument(data);
}

export async function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Promise<HouseholdDocument | null> {
  const supabase = getSupabase();
  const dbData = inputToDb(input);
  dbData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("documents")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToDocument(data);
}

export async function deleteDocument(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  return !error;
}
