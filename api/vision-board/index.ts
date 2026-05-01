import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";

function dbToItem(row: any) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    domain: row.domain,
    createdAt: row.created_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("futureframe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(dbToItem));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
