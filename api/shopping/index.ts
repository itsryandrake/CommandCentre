import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";

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
  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("is_checked", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(dbToItem));
  }

  if (req.method === "POST") {
    const { name, quantity, category, addedBy } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });

    const { data, error } = await supabase
      .from("shopping_items")
      .insert({
        name,
        quantity: quantity || 1,
        category,
        added_by: addedBy,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(dbToItem(data));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
