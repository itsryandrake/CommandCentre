export interface Reminder {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: "low" | "normal" | "high";
  completed: boolean;
  completed_at?: string;
  family_member?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority?: "low" | "normal" | "high";
  family_member?: string;
}
