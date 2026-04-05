import type { Task } from "@shared/types/task";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Calendar, Paperclip, AlertCircle } from "lucide-react";

const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-600" },
  normal: { label: "Normal", className: "bg-blue-100 text-blue-700" },
  high: { label: "High", className: "bg-amber-100 text-amber-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
};

const ASSIGNEE_INITIALS: Record<string, string> = {
  ryan: "RD",
  emily: "ED",
  both: "All",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.normal;
  const isOverdue = task.status === "delayed";

  return (
    <GlassCard
      className={`cursor-pointer hover:bg-card/80 transition-colors ${isOverdue ? "border-red-300/50" : ""}`}
      onClick={onClick}
    >
      <GlassCardContent className="py-3 px-4">
        <div className="space-y-2">
          {/* Title + priority */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${priority.className}`}>
              {priority.label}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.assignedTo && (
              <span className="flex items-center gap-1">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-medium">
                  {ASSIGNEE_INITIALS[task.assignedTo]}
                </span>
              </span>
            )}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                {isOverdue && <AlertCircle className="size-3" />}
                <Calendar className="size-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
