import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";

function dbToTask(row: any) {
  const task: any = {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    category: row.category,
    dueDate: row.due_date,
    isArchived: row.is_archived,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (task.dueDate && task.status !== "done" && task.status !== "delayed") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    if (due < today) task.status = "delayed";
  }

  return task;
}

function inputToDb(input: any): any {
  const db: any = {};
  if (input.title !== undefined) db.title = input.title;
  if (input.description !== undefined) db.description = input.description;
  if (input.status !== undefined) db.status = input.status;
  if (input.priority !== undefined) db.priority = input.priority;
  if (input.assignedTo !== undefined) db.assigned_to = input.assignedTo;
  if (input.category !== undefined) db.category = input.category;
  if (input.dueDate !== undefined) db.due_date = input.dueDate;
  if (input.isArchived !== undefined) db.is_archived = input.isArchived;
  if (input.createdBy !== undefined) db.created_by = input.createdBy;
  return db;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  const supabase = getSupabase();

  if (req.method === "PATCH") {
    const dbData = inputToDb(req.body || {});
    dbData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("tasks")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: "Task not found" });
    return res.json(dbToTask(data));
  }

  if (req.method === "DELETE") {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
