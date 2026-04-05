import type { Task, TaskStatus } from "@shared/types/task";
import { TaskCard } from "./TaskCard";

const COLUMNS: { status: TaskStatus; label: string; colour: string }[] = [
  { status: "todo", label: "To Do", colour: "border-blue-300/50" },
  { status: "doing", label: "Doing", colour: "border-amber-300/50" },
  { status: "delayed", label: "Delayed", colour: "border-red-300/50" },
  { status: "done", label: "Done", colour: "border-green-300/50" },
];

interface KanbanBoardProps {
  todo: Task[];
  doing: Task[];
  delayed: Task[];
  done: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function KanbanBoard({ todo, doing, delayed, done, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const columnData: Record<TaskStatus, Task[]> = { todo, doing, delayed, done };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const tasks = columnData[col.status];
        return (
          <div key={col.status} className={`rounded-xl border-2 ${col.colour} bg-muted/20 p-3`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id}>
                    <TaskCard task={task} onClick={() => onTaskClick(task)} />
                    {/* Quick status buttons */}
                    <div className="flex gap-1 mt-1">
                      {COLUMNS.filter((c) => c.status !== col.status && c.status !== "delayed").map((target) => (
                        <button
                          key={target.status}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(task.id, target.status);
                          }}
                          className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                        >
                          → {target.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
