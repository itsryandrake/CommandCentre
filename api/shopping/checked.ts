import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("is_checked", true)
    .select("id");

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, cleared: data?.length || 0 });
}
