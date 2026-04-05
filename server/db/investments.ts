import { getSupabase } from "./supabase.ts";
import type {
  Investment, InvestmentPayment, InvestmentDocument, InvestmentTask,
  InvestmentWithDetails, CreateInvestmentInput, UpdateInvestmentInput,
  CreatePaymentInput, CreateDocumentInput, CreateTaskInput,
} from "../../shared/types/investment.ts";

function dbToInvestment(row: any): Investment {
  return {
    id: row.id,
    name: row.name,
    projectName: row.project_name,
    tower: row.tower,
    unitNumber: row.unit_number,
    areaSqft: row.area_sqft ? Number(row.area_sqft) : undefined,
    areaSqm: row.area_sqm ? Number(row.area_sqm) : undefined,
    purchasePriceLocal: row.purchase_price_local ? Number(row.purchase_price_local) : undefined,
    purchasePriceAud: row.purchase_price_aud ? Number(row.purchase_price_aud) : undefined,
    currency: row.currency || "AED",
    location: row.location,
    country: row.country,
    status: row.status,
    completionDate: row.completion_date,
    description: row.description,
    imageUrl: row.image_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToPayment(row: any): InvestmentPayment {
  return {
    id: row.id,
    investmentId: row.investment_id,
    label: row.label,
    amountLocal: Number(row.amount_local),
    amountAud: row.amount_aud ? Number(row.amount_aud) : undefined,
    dateDue: row.date_due,
    datePaid: row.date_paid,
    isPaid: row.is_paid,
    percentage: row.percentage ? Number(row.percentage) : undefined,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function dbToDocument(row: any): InvestmentDocument {
  return {
    id: row.id,
    investmentId: row.investment_id,
    name: row.name,
    fileUrl: row.file_url,
    fileType: row.file_type,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

function dbToTask(row: any): InvestmentTask {
  return {
    id: row.id,
    investmentId: row.investment_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    isDone: row.is_done,
    createdAt: row.created_at,
  };
}

function investmentInputToDb(input: CreateInvestmentInput | UpdateInvestmentInput): any {
  const db: any = {};
  if (input.name !== undefined) db.name = input.name;
  if (input.projectName !== undefined) db.project_name = input.projectName;
  if (input.tower !== undefined) db.tower = input.tower;
  if (input.unitNumber !== undefined) db.unit_number = input.unitNumber;
  if (input.areaSqft !== undefined) db.area_sqft = input.areaSqft;
  if (input.areaSqm !== undefined) db.area_sqm = input.areaSqm;
  if (input.purchasePriceLocal !== undefined) db.purchase_price_local = input.purchasePriceLocal;
  if (input.purchasePriceAud !== undefined) db.purchase_price_aud = input.purchasePriceAud;
  if (input.currency !== undefined) db.currency = input.currency;
  if (input.location !== undefined) db.location = input.location;
  if (input.country !== undefined) db.country = input.country;
  if (input.status !== undefined) db.status = input.status;
  if (input.completionDate !== undefined) db.completion_date = input.completionDate;
  if (input.description !== undefined) db.description = input.description;
  if (input.imageUrl !== undefined) db.image_url = input.imageUrl;
  if (input.notes !== undefined) db.notes = input.notes;
  return db;
}

// Investments CRUD
export async function listInvestments(): Promise<(Investment & { totalPaidLocal: number; totalPaidAud: number })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("investments").select("*").order("name");
  if (error) throw error;

  const investments = (data || []).map(dbToInvestment);

  // Fetch paid totals for all investments
  const { data: payments } = await supabase
    .from("investment_payments")
    .select("investment_id, amount_local, amount_aud, is_paid")
    .eq("is_paid", true);

  const paidByInvestment: Record<string, { local: number; aud: number }> = {};
  for (const p of payments || []) {
    if (!paidByInvestment[p.investment_id]) paidByInvestment[p.investment_id] = { local: 0, aud: 0 };
    paidByInvestment[p.investment_id].local += Number(p.amount_local) || 0;
    paidByInvestment[p.investment_id].aud += Number(p.amount_aud) || 0;
  }

  return investments.map((inv) => ({
    ...inv,
    totalPaidLocal: paidByInvestment[inv.id]?.local || 0,
    totalPaidAud: paidByInvestment[inv.id]?.aud || 0,
  }));
}

export async function getInvestmentWithDetails(id: string): Promise<InvestmentWithDetails | null> {
  const supabase = getSupabase();
  const { data: inv, error } = await supabase.from("investments").select("*").eq("id", id).single();
  if (error || !inv) return null;

  const [payments, documents, tasks] = await Promise.all([
    supabase.from("investment_payments").select("*").eq("investment_id", id).order("date_due", { ascending: true, nullsFirst: false }),
    supabase.from("investment_documents").select("*").eq("investment_id", id).order("created_at", { ascending: false }),
    supabase.from("investment_tasks").select("*").eq("investment_id", id).order("created_at", { ascending: false }),
  ]);

  return {
    ...dbToInvestment(inv),
    payments: (payments.data || []).map(dbToPayment),
    documents: (documents.data || []).map(dbToDocument),
    tasks: (tasks.data || []).map(dbToTask),
  };
}

export async function createInvestment(input: CreateInvestmentInput): Promise<Investment> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("investments").insert(investmentInputToDb(input)).select().single();
  if (error) throw error;
  return dbToInvestment(data);
}

export async function updateInvestment(id: string, input: UpdateInvestmentInput): Promise<Investment | null> {
  const supabase = getSupabase();
  const dbData = investmentInputToDb(input);
  dbData.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("investments").update(dbData).eq("id", id).select().single();
  if (error || !data) return null;
  return dbToInvestment(data);
}

export async function deleteInvestment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("investments").delete().eq("id", id);
  return !error;
}

// Payments
export async function addPayment(investmentId: string, input: CreatePaymentInput): Promise<InvestmentPayment> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("investment_payments").insert({
    investment_id: investmentId,
    label: input.label,
    amount_local: input.amountLocal,
    amount_aud: input.amountAud,
    date_due: input.dateDue,
    date_paid: input.datePaid,
    is_paid: input.isPaid || false,
    percentage: input.percentage,
    notes: input.notes,
  }).select().single();
  if (error) throw error;
  return dbToPayment(data);
}

export async function updatePayment(id: string, updates: Partial<CreatePaymentInput & { isPaid: boolean }>): Promise<InvestmentPayment | null> {
  const supabase = getSupabase();
  const db: any = {};
  if (updates.label !== undefined) db.label = updates.label;
  if (updates.amountLocal !== undefined) db.amount_local = updates.amountLocal;
  if (updates.amountAud !== undefined) db.amount_aud = updates.amountAud;
  if (updates.dateDue !== undefined) db.date_due = updates.dateDue;
  if (updates.datePaid !== undefined) db.date_paid = updates.datePaid;
  if (updates.isPaid !== undefined) db.is_paid = updates.isPaid;
  if (updates.percentage !== undefined) db.percentage = updates.percentage;
  if (updates.notes !== undefined) db.notes = updates.notes;
  const { data, error } = await supabase.from("investment_payments").update(db).eq("id", id).select().single();
  if (error || !data) return null;
  return dbToPayment(data);
}

export async function deletePayment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("investment_payments").delete().eq("id", id);
  return !error;
}

// Documents
export async function addDocument(investmentId: string, input: CreateDocumentInput): Promise<InvestmentDocument> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("investment_documents").insert({
    investment_id: investmentId,
    name: input.name,
    file_url: input.fileUrl,
    file_type: input.fileType,
    uploaded_by: input.uploadedBy,
  }).select().single();
  if (error) throw error;
  return dbToDocument(data);
}

export async function deleteDocument(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("investment_documents").delete().eq("id", id);
  return !error;
}

// Tasks
export async function addInvestmentTask(investmentId: string, input: CreateTaskInput): Promise<InvestmentTask> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("investment_tasks").insert({
    investment_id: investmentId,
    title: input.title,
    description: input.description,
    due_date: input.dueDate,
  }).select().single();
  if (error) throw error;
  return dbToTask(data);
}

export async function updateInvestmentTask(id: string, updates: Partial<{ title: string; description: string; dueDate: string; isDone: boolean }>): Promise<InvestmentTask | null> {
  const supabase = getSupabase();
  const db: any = {};
  if (updates.title !== undefined) db.title = updates.title;
  if (updates.description !== undefined) db.description = updates.description;
  if (updates.dueDate !== undefined) db.due_date = updates.dueDate;
  if (updates.isDone !== undefined) db.is_done = updates.isDone;
  const { data, error } = await supabase.from("investment_tasks").update(db).eq("id", id).select().single();
  if (error || !data) return null;
  return dbToTask(data);
}

export async function deleteInvestmentTask(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("investment_tasks").delete().eq("id", id);
  return !error;
}
