import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";

const TABLE = "dreamhome_wishlist";
const BUCKET = "dreamhome-images";
const STORAGE_PREFIX = "wishlist/";

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

const FIELD_MAP: Record<string, string> = {
  title: "title",
  description: "description",
  imageUrl: "image_url",
  sourceUrl: "source_url",
  price: "price",
  room: "room",
  priority: "priority",
  status: "status",
  quantity: "quantity",
  notes: "notes",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  const supabase = getSupabase();

  if (req.method === "PATCH") {
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      const dbKey = FIELD_MAP[key];
      if (dbKey) updates[dbKey] = value;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(dbToItem(data));
  }

  if (req.method === "DELETE") {
    const { data: item } = await supabase
      .from(TABLE)
      .select("image_url")
      .eq("id", id)
      .single();

    if (item?.image_url?.includes(`${BUCKET}/${STORAGE_PREFIX}`)) {
      const path = item.image_url.split(`${BUCKET}/`).pop();
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      }
    }

    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
