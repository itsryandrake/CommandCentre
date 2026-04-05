export type TaskStatus = "todo" | "doing" | "delayed" | "done";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: "ryan" | "emily" | "both";
  category?: string;
  dueDate?: string;
  isArchived: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: "ryan" | "emily" | "both";
  category?: string;
  dueDate?: string;
  createdBy?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput & {
  status: TaskStatus;
  isArchived: boolean;
}>;

export interface CreateAttachmentInput {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  uploadedBy?: string;
}
