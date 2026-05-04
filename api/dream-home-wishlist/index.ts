import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";

function dbToItem(row: any) {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    domain: row.domain,
    title: row.title,
    description: row.description,
    price: row.price !== null ? Number(row.price) : null,
    room: row.room,
    priority: row.priority,
    status: row.status,
    quantity: row.quantity,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = getSupabase();
  let query = supabase
    .from("dreamhome_wishlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (req.query.room) query = query.eq("room", String(req.query.room));
  if (req.query.status) query = query.eq("status", String(req.query.status));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map(dbToItem));
}
