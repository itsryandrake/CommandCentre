import { getSupabase } from "./supabase.ts";
import type {
  Property,
  Loan,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateLoanInput,
  UpdateLoanInput,
} from "../../shared/types/finance.ts";

function dbToProperty(row: any): Property {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
    currentValue: row.current_value ? Number(row.current_value) : undefined,
    purchaseDate: row.purchase_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToLoan(row: any): Loan {
  return {
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    type: row.type,
    lender: row.lender,
    originalAmount: row.original_amount ? Number(row.original_amount) : undefined,
    currentBalance: row.current_balance ? Number(row.current_balance) : undefined,
    interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
    monthlyPayment: row.monthly_payment ? Number(row.monthly_payment) : undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    isFixedRate: row.is_fixed_rate,
    fixedRateExpiry: row.fixed_rate_expiry,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function propertyInputToDb(input: CreatePropertyInput | UpdatePropertyInput): any {
  const db: any = {};
  if (input.name !== undefined) db.name = input.name;
  if (input.type !== undefined) db.type = input.type;
  if (input.address !== undefined) db.address = input.address;
  if (input.purchasePrice !== undefined) db.purchase_price = input.purchasePrice;
  if (input.currentValue !== undefined) db.current_value = input.currentValue;
  if (input.purchaseDate !== undefined) db.purchase_date = input.purchaseDate;
  return db;
}

function loanInputToDb(input: CreateLoanInput | UpdateLoanInput): any {
  const db: any = {};
  if (input.propertyId !== undefined) db.property_id = input.propertyId;
  if (input.name !== undefined) db.name = input.name;
  if (input.type !== undefined) db.type = input.type;
  if (input.lender !== undefined) db.lender = input.lender;
  if (input.originalAmount !== undefined) db.original_amount = input.originalAmount;
  if (input.currentBalance !== undefined) db.current_balance = input.currentBalance;
  if (input.interestRate !== undefined) db.interest_rate = input.interestRate;
  if (input.monthlyPayment !== undefined) db.monthly_payment = input.monthlyPayment;
  if (input.startDate !== undefined) db.start_date = input.startDate;
  if (input.endDate !== undefined) db.end_date = input.endDate;
  if (input.isFixedRate !== undefined) db.is_fixed_rate = input.isFixedRate;
  if (input.fixedRateExpiry !== undefined) db.fixed_rate_expiry = input.fixedRateExpiry;
  if (input.notes !== undefined) db.notes = input.notes;
  return db;
}

// Properties
export async function listProperties(): Promise<Property[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []).map(dbToProperty);
}

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("properties")
    .insert(propertyInputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToProperty(data);
}

export async function updateProperty(id: string, input: UpdatePropertyInput): Promise<Property | null> {
  const supabase = getSupabase();
  const dbData = propertyInputToDb(input);
  dbData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("properties")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToProperty(data);
}

// Loans
export async function listLoans(propertyId?: string): Promise<Loan[]> {
  const supabase = getSupabase();
  let query = supabase.from("loans").select("*").order("name", { ascending: true });
  if (propertyId) query = query.eq("property_id", propertyId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToLoan);
}

export async function createLoan(input: CreateLoanInput): Promise<Loan> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("loans")
    .insert(loanInputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToLoan(data);
}

export async function updateLoan(id: string, input: UpdateLoanInput): Promise<Loan | null> {
  const supabase = getSupabase();
  const dbData = loanInputToDb(input);
  dbData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("loans")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToLoan(data);
}

export async function deleteLoan(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", id);

  return !error;
}
