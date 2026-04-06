import { useState } from "react";
import type { Task, TaskStatus } from "@shared/types/task";
import { TaskCard } from "./TaskCard";

const COLUMNS: { status: TaskStatus; label: string; colour: string; dropHighlight: string }[] = [
  { status: "todo", label: "To Do", colour: "border-blue-300/50", dropHighlight: "border-blue-400 bg-blue-50/50" },
  { status: "doing", label: "Doing", colour: "border-amber-300/50", dropHighlight: "border-amber-400 bg-amber-50/50" },
  { status: "delayed", label: "Delayed", colour: "border-red-300/50", dropHighlight: "border-red-400 bg-red-50/50" },
  { status: "done", label: "Done", colour: "border-green-300/50", dropHighlight: "border-green-400 bg-green-50/50" },
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
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
    setDragOverColumn(null);
    setDraggingTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const tasks = columnData[col.status];
        const isDropTarget = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            className={`rounded-xl border-2 bg-muted/20 p-3 transition-colors duration-150 ${
              isDropTarget ? col.dropHighlight : col.colour
            }`}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {tasks.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[60px]">
              {tasks.length === 0 ? (
                <p className={`text-xs text-center py-4 ${isDropTarget ? "text-foreground/50" : "text-muted-foreground"}`}>
                  {isDropTarget ? "Drop here" : "No tasks"}
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-opacity duration-150 ${
                      draggingTaskId === task.id ? "opacity-40" : ""
                    }`}
                  >
                    <TaskCard task={task} onClick={() => onTaskClick(task)} />
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
