import { getSupabase } from "./supabase.ts";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskAttachment, CreateAttachmentInput } from "../../shared/types/task.ts";

function dbToTask(row: any): Task {
  const task: Task = {
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

  // Auto-delay: if due date is past and status is todo/doing, show as delayed
  if (task.dueDate && task.status !== "done" && task.status !== "delayed") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    if (due < today) {
      task.status = "delayed";
    }
  }

  return task;
}

function dbToAttachment(row: any): TaskAttachment {
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

function taskInputToDb(input: CreateTaskInput | UpdateTaskInput): any {
  const db: any = {};
  if (input.title !== undefined) db.title = input.title;
  if (input.description !== undefined) db.description = input.description;
  if ((input as UpdateTaskInput).status !== undefined) db.status = (input as UpdateTaskInput).status;
  if (input.priority !== undefined) db.priority = input.priority;
  if (input.assignedTo !== undefined) db.assigned_to = input.assignedTo;
  if (input.category !== undefined) db.category = input.category;
  if (input.dueDate !== undefined) db.due_date = input.dueDate;
  if ((input as UpdateTaskInput).isArchived !== undefined) db.is_archived = (input as UpdateTaskInput).isArchived;
  if (input.createdBy !== undefined) db.created_by = input.createdBy;
  return db;
}

export async function listTasks(filters?: { status?: string; assignedTo?: string; archived?: boolean }): Promise<Task[]> {
  const supabase = getSupabase();
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

  if (filters?.archived === false) {
    query = query.eq("is_archived", false);
  } else if (filters?.archived === true) {
    query = query.eq("is_archived", true);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.assignedTo) {
    query = query.or(`assigned_to.eq.${filters.assignedTo},assigned_to.eq.both`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToTask);
}

export async function getTask(id: string): Promise<Task | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error || !data) return null;
  return dbToTask(data);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .insert(taskInputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToTask(data);
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const supabase = getSupabase();
  const dbData = taskInputToDb(input);
  dbData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToTask(data);
}

export async function deleteTask(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  return !error;
}

// Attachments
export async function listAttachments(taskId: string): Promise<TaskAttachment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(dbToAttachment);
}

export async function addAttachment(taskId: string, input: CreateAttachmentInput): Promise<TaskAttachment> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("task_attachments")
    .insert({
      task_id: taskId,
      file_name: input.fileName,
      file_url: input.fileUrl,
      file_type: input.fileType,
      uploaded_by: input.uploadedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return dbToAttachment(data);
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("task_attachments").delete().eq("id", id);
  return !error;
}
