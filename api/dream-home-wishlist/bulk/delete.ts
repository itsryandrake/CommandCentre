import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.js";

const TABLE = "dreamhome_wishlist";
const BUCKET = "dreamhome-images";
const STORAGE_PREFIX = "wishlist/";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids[] is required" });
  }

  const supabase = getSupabase();

  const { data: items } = await supabase.from(TABLE).select("image_url").in("id", ids);
  const paths =
    (items || [])
      .map((i: any) => i.image_url as string | null)
      .filter((u): u is string => !!u && u.includes(`${BUCKET}/${STORAGE_PREFIX}`))
      .map((u) => u.split(`${BUCKET}/`).pop()!)
      .filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths).catch(() => {});
  }

  const { error } = await supabase.from(TABLE).delete().in("id", ids);
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ ok: true, deleted: ids.length });
}
