import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const attachmentId = req.query.attachmentId as string;
  if (!attachmentId) {
    return res.status(400).json({ error: "attachmentId is required" });
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("task_attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
}
