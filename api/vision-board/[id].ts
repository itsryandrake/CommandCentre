import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  const supabase = getSupabase();

  if (req.method === "PATCH") {
    const { category, price } = req.body || {};

    const updates: Record<string, any> = {};
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = price;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { error } = await supabase
      .from("futureframe_items")
      .update(updates)
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { data: item } = await supabase
      .from("futureframe_items")
      .select("image_url")
      .eq("id", id)
      .single();

    if (item?.image_url?.includes("futureframe-images")) {
      const path = item.image_url.split("futureframe-images/").pop();
      if (path) {
        await supabase.storage
          .from("futureframe-images")
          .remove([path])
          .catch(() => {});
      }
    }

    const { error } = await supabase
      .from("futureframe_items")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
