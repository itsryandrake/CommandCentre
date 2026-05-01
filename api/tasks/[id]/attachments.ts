import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.ts";

function dbToAttachment(row: any) {
  return {
    id: row.id,
    taskId: row.task_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileType: row.file_type,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const taskId = req.query.id as string;
  if (!taskId) return res.status(400).json({ error: "task id is required" });

  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("task_attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(dbToAttachment));
  }

  if (req.method === "POST") {
    const { fileName, fileUrl, fileType, uploadedBy } = req.body || {};
    if (!fileName || !fileUrl) {
      return res.status(400).json({ error: "fileName and fileUrl are required" });
    }

    const { data, error } = await supabase
      .from("task_attachments")
      .insert({
        task_id: taskId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(dbToAttachment(data));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
