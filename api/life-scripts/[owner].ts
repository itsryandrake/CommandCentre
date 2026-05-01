import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";

function dbToScript(row: any) {
  return {
    id: row.id,
    owner: row.owner,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const owner = req.query.owner as string;
  if (owner !== "ryan" && owner !== "emily") {
    return res.status(400).json({ error: "owner must be ryan or emily" });
  }

  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("life_scripts")
      .select("*")
      .eq("owner", owner)
      .single();

    if (error || !data) return res.json(null);
    return res.json(dbToScript(data));
  }

  if (req.method === "PUT") {
    const input = req.body || {};

    const { data: existing } = await supabase
      .from("life_scripts")
      .select("*")
      .eq("owner", owner)
      .single();

    if (existing) {
      await supabase.from("life_script_versions").insert({
        script_id: existing.id,
        content: existing.content,
      });

      const updates: any = { updated_at: new Date().toISOString() };
      if (input.title !== undefined) updates.title = input.title;
      if (input.content !== undefined) updates.content = input.content;

      const { data, error } = await supabase
        .from("life_scripts")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json(dbToScript(data));
    }

    const { data, error } = await supabase
      .from("life_scripts")
      .insert({
        owner,
        title: input.title || "Life Script",
        content: input.content || "",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(dbToScript(data));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
