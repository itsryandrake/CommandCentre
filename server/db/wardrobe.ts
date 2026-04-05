import { getSupabase } from "./supabase.ts";
import type {
  WardrobeItem,
  CreateWardrobeInput,
  UpdateWardrobeInput,
} from "../../shared/types/wardrobe.ts";

function dbToItem(row: any): WardrobeItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    colour: row.colour,
    size: row.size,
    imageUrl: row.image_url,
    productUrl: row.product_url,
    purchasePrice: row.purchase_price ? Number(row.purchase_price) : null,
    purchaseDate: row.purchase_date,
    notes: row.notes,
    addedBy: row.added_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inputToDb(input: CreateWardrobeInput | UpdateWardrobeInput): Record<string, any> {
  const db: Record<string, any> = {};
  if (input.name !== undefined) db.name = input.name;
  if (input.category !== undefined) db.category = input.category;
  if (input.brand !== undefined) db.brand = input.brand;
  if (input.colour !== undefined) db.colour = input.colour;
  if (input.size !== undefined) db.size = input.size;
  if (input.imageUrl !== undefined) db.image_url = input.imageUrl;
  if (input.productUrl !== undefined) db.product_url = input.productUrl;
  if (input.purchasePrice !== undefined) db.purchase_price = input.purchasePrice;
  if (input.purchaseDate !== undefined) db.purchase_date = input.purchaseDate;
  if (input.notes !== undefined) db.notes = input.notes;
  if (input.addedBy !== undefined) db.added_by = input.addedBy;
  return db;
}

export async function listWardrobe(
  category?: string,
  brand?: string,
  colour?: string,
  size?: string
): Promise<WardrobeItem[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("wardrobe")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (brand) query = query.ilike("brand", `%${brand}%`);
  if (colour) query = query.ilike("colour", `%${colour}%`);
  if (size) query = query.eq("size", size);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToItem);
}

export async function createWardrobeItem(input: CreateWardrobeInput): Promise<WardrobeItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wardrobe")
    .insert(inputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToItem(data);
}

export async function updateWardrobeItem(
  id: string,
  input: UpdateWardrobeInput
): Promise<WardrobeItem | null> {
  const supabase = getSupabase();
  const updates = inputToDb(input);
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("wardrobe")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data ? dbToItem(data) : null;
}

export async function deleteWardrobeItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("wardrobe").delete().eq("id", id);
  if (error) throw error;
  return true;
}
