import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const owner = req.query.owner as string;
  if (owner !== "ryan" && owner !== "emily") {
    return res.status(400).json({ error: "owner must be ryan or emily" });
  }

  const supabase = getSupabase();

  const { data: script } = await supabase
    .from("life_scripts")
    .select("id")
    .eq("owner", owner)
    .single();

  if (!script) return res.json([]);

  const { data, error } = await supabase
    .from("life_script_versions")
    .select("*")
    .eq("script_id", script.id)
    .order("saved_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  return res.json(
    (data || []).map((row: any) => ({
      id: row.id,
      scriptId: row.script_id,
      content: row.content,
      savedAt: row.saved_at,
    }))
  );
}
