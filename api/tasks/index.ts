import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";

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
  const supabase = getSupabase();

  if (req.method === "GET") {
    const { status, assigned, archived } = req.query;
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (archived === "false") query = query.eq("is_archived", false);
    else if (archived === "true") query = query.eq("is_archived", true);

    if (status) query = query.eq("status", status as string);

    if (assigned) {
      query = query.or(`assigned_to.eq.${assigned},assigned_to.eq.both`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(dbToTask));
  }

  if (req.method === "POST") {
    const input = req.body || {};
    if (!input.title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("tasks")
      .insert(inputToDb(input))
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(dbToTask(data));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
