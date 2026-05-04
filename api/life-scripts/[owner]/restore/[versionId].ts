import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const owner = req.query.owner as string;
  const versionId = req.query.versionId as string;
  if (owner !== "ryan" && owner !== "emily") {
    return res.status(400).json({ error: "owner must be ryan or emily" });
  }

  const supabase = getSupabase();

  const { data: script } = await supabase
    .from("life_scripts")
    .select("*")
    .eq("owner", owner)
    .single();

  if (!script) return res.status(404).json({ error: "Script not found" });

  const { data: version } = await supabase
    .from("life_script_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (!version) return res.status(404).json({ error: "Version not found" });

  await supabase.from("life_script_versions").insert({
    script_id: script.id,
    content: script.content,
  });

  const { data, error } = await supabase
    .from("life_scripts")
    .update({ content: version.content, updated_at: new Date().toISOString() })
    .eq("id", script.id)
    .select()
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message });

  return res.json({
    id: data.id,
    owner: data.owner,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
    createdAt: data.created_at,
  });
}
