import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";

function dbToItem(row: any) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  const supabase = getSupabase();

  if (req.method === "PATCH") {
    const updates = req.body || {};
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isChecked !== undefined) dbUpdates.is_checked = updates.isChecked;

    const { data, error } = await supabase
      .from("shopping_items")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: "Item not found" });
    return res.json(dbToItem(data));
  }

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
