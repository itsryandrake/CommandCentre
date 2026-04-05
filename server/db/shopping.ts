import { getSupabase } from "./supabase.ts";
import type { ShoppingItem, CreateShoppingItemInput } from "../../shared/types/shopping.ts";

function dbToItem(row: any): ShoppingItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    category: row.category,
    isChecked: row.is_checked,
    addedBy: row.added_by,
    createdAt: row.created_at,
  };
}

export async function listShoppingItems(): Promise<ShoppingItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .order("is_checked", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(dbToItem);
}

export async function createShoppingItem(input: CreateShoppingItemInput): Promise<ShoppingItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shopping_items")
    .insert({
      name: input.name,
      quantity: input.quantity || 1,
      category: input.category,
      added_by: input.addedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return dbToItem(data);
}

export async function updateShoppingItem(id: string, updates: Partial<{ name: string; quantity: number; category: string; isChecked: boolean }>): Promise<ShoppingItem | null> {
  const supabase = getSupabase();
  const db: any = {};
  if (updates.name !== undefined) db.name = updates.name;
  if (updates.quantity !== undefined) db.quantity = updates.quantity;
  if (updates.category !== undefined) db.category = updates.category;
  if (updates.isChecked !== undefined) db.is_checked = updates.isChecked;

  const { data, error } = await supabase
    .from("shopping_items")
    .update(db)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToItem(data);
}

export async function deleteShoppingItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  return !error;
}

export async function clearCheckedItems(): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("is_checked", true)
    .select("id");

  if (error) throw error;
  return data?.length || 0;
}
