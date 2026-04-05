import { getSupabase } from "./supabase.ts";
import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput, EquipmentNote } from "../../shared/types/equipment.ts";

function dbToEquipment(row: any): Equipment {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    model: row.model,
    status: row.status,
    imageUrl: row.image_url,
    productUrl: row.product_url,
    purchaseDate: row.purchase_date,
    purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
    warrantyExpiry: row.warranty_expiry,
    lastServiced: row.last_serviced,
    nextServiceDue: row.next_service_due,
    serviceIntervalMonths: row.service_interval_months,
    location: row.location,
    addedBy: row.added_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToNote(row: any): EquipmentNote {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    content: row.content,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function inputToDb(input: CreateEquipmentInput | UpdateEquipmentInput): any {
  const db: any = {};
  if (input.name !== undefined) db.name = input.name;
  if (input.category !== undefined) db.category = input.category;
  if (input.brand !== undefined) db.brand = input.brand;
  if (input.model !== undefined) db.model = input.model;
  if (input.status !== undefined) db.status = input.status;
  if (input.imageUrl !== undefined) db.image_url = input.imageUrl;
  if (input.productUrl !== undefined) db.product_url = input.productUrl;
  if (input.purchaseDate !== undefined) db.purchase_date = input.purchaseDate;
  if (input.purchasePrice !== undefined) db.purchase_price = input.purchasePrice;
  if (input.warrantyExpiry !== undefined) db.warranty_expiry = input.warrantyExpiry;
  if (input.lastServiced !== undefined) db.last_serviced = input.lastServiced;
  if (input.nextServiceDue !== undefined) db.next_service_due = input.nextServiceDue;
  if (input.serviceIntervalMonths !== undefined) db.service_interval_months = input.serviceIntervalMonths;
  if (input.location !== undefined) db.location = input.location;
  if (input.addedBy !== undefined) db.added_by = input.addedBy;
  return db;
}

export async function listEquipment(category?: string, status?: string): Promise<Equipment[]> {
  const supabase = getSupabase();
  let query = supabase.from("equipment").select("*").order("name", { ascending: true });
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToEquipment);
}

export async function getEquipment(id: string): Promise<Equipment | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return dbToEquipment(data);
}

export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("equipment")
    .insert(inputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToEquipment(data);
}

export async function updateEquipment(id: string, input: UpdateEquipmentInput): Promise<Equipment | null> {
  const supabase = getSupabase();
  const dbData = inputToDb(input);
  dbData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("equipment")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToEquipment(data);
}

export async function deleteEquipment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("equipment")
    .delete()
    .eq("id", id);

  return !error;
}

// Equipment Notes
export async function listNotes(equipmentId: string): Promise<EquipmentNote[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("equipment_notes")
    .select("*")
    .eq("equipment_id", equipmentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(dbToNote);
}

export async function addNote(equipmentId: string, content: string, createdBy?: string): Promise<EquipmentNote> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("equipment_notes")
    .insert({ equipment_id: equipmentId, content, created_by: createdBy })
    .select()
    .single();

  if (error) throw error;
  return dbToNote(data);
}

export async function deleteNote(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("equipment_notes")
    .delete()
    .eq("id", id);

  return !error;
}
