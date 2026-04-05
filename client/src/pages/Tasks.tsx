import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTasks } from "@/hooks/useTasks";
import { useUser } from "@/context/UserContext";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from "@shared/types/task";
import { Plus, LayoutGrid, List, Archive, Trash2, Pencil, X } from "lucide-react";

const VIEW_KEY = "drake_tasks_view";

export function Tasks() {
  const {
    tasks, todo, doing, delayed, done,
    isLoading, showArchived, setShowArchived,
    add, update, remove, archive, changeStatus,
  } = useTasks();
  const { user } = useUser();

  const [view, setView] = useState<"kanban" | "list">(() => {
    return (localStorage.getItem(VIEW_KEY) as "kanban" | "list") || "kanban";
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [viewing, setViewing] = useState<Task | undefined>();
  const [assignFilter, setAssignFilter] = useState<string>("all");

  const switchView = (v: "kanban" | "list") => {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const handleCreate = async (input: CreateTaskInput) => {
    await add(input);
  };

  const handleEdit = async (input: CreateTaskInput) => {
    if (!editing) return;
    await update(editing.id, input as UpdateTaskInput);
    setEditing(undefined);
    setViewing(undefined);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await changeStatus(taskId, status);
  };

  const handleTaskClick = (task: Task) => {
    setViewing(task);
  };

  // Filter by assignee
  const filterTasks = (list: Task[]) => {
    if (assignFilter === "all") return list;
    return list.filter((t) => t.assignedTo === assignFilter || t.assignedTo === "both");
  };

  const filteredTodo = filterTasks(todo);
  const filteredDoing = filterTasks(doing);
  const filteredDelayed = filterTasks(delayed);
  const filteredDone = filterTasks(done);
  const allFiltered = [...filteredTodo, ...filteredDoing, ...filteredDelayed, ...filteredDone];

  return (
    <DashboardLayout title="Tasks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">
              {tasks.length} tasks · {todo.length + doing.length} active
            </p>
          </div>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            New Task
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => switchView("kanban")}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === "kanban" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                <LayoutGrid className="size-3.5" />
                Kanban
              </button>
              <button
                onClick={() => switchView("list")}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                <List className="size-3.5" />
                List
              </button>
            </div>

            {/* Assignee filter */}
            <div className="flex gap-1">
              {["all", "ryan", "emily"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAssignFilter(a)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors capitalize ${
                    assignFilter === a
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "border-border/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {a === "all" ? "All" : a}
                </button>
              ))}
            </div>
          </div>

          {/* Show archived toggle */}
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded"
            />
            Show archived
          </label>
        </div>

        {/* Content */}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading tasks...</p>
        ) : view === "kanban" ? (
          <KanbanBoard
            todo={filteredTodo}
            doing={filteredDoing}
            delayed={filteredDelayed}
            done={filteredDone}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
          />
        ) : (
          /* List view */
          <div className="space-y-6">
            {(
              [
                { label: "To Do", tasks: filteredTodo, colour: "text-blue-500" },
                { label: "Doing", tasks: filteredDoing, colour: "text-amber-500" },
                { label: "Delayed", tasks: filteredDelayed, colour: "text-red-500" },
                { label: "Done", tasks: filteredDone, colour: "text-green-500" },
              ] as const
            ).map((group) =>
              group.tasks.length > 0 ? (
                <div key={group.label} className="space-y-2">
                  <h3 className={`text-sm font-semibold ${group.colour}`}>
                    {group.label} ({group.tasks.length})
                  </h3>
                  {group.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                  ))}
                </div>
              ) : null
            )}
            {allFiltered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No tasks yet. Create one to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">{viewing.title}</h2>
              <button onClick={() => setViewing(undefined)} className="p-2 rounded-lg hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>

            {viewing.description && (
              <p className="text-sm text-muted-foreground mb-4">{viewing.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="capitalize">{viewing.status === "todo" ? "To Do" : viewing.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Priority</p>
                <p className="capitalize">{viewing.priority}</p>
              </div>
              {viewing.assignedTo && (
                <div>
                  <p className="text-muted-foreground text-xs">Assigned to</p>
                  <p className="capitalize">{viewing.assignedTo}</p>
                </div>
              )}
              {viewing.dueDate && (
                <div>
                  <p className="text-muted-foreground text-xs">Due date</p>
                  <p>{new Date(viewing.dueDate).toLocaleDateString("en-AU")}</p>
                </div>
              )}
            </div>

            {/* Status change buttons */}
            <div className="flex gap-2 mb-4">
              {(["todo", "doing", "done"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    changeStatus(viewing.id, s);
                    setViewing({ ...viewing, status: s });
                  }}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                    viewing.status === s ? "bg-primary/10 border-primary/30 text-primary" : "hover:bg-muted"
                  }`}
                >
                  {s === "todo" ? "To Do" : s}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t pt-4">
              <button
                onClick={() => {
                  setViewing(undefined);
                  setEditing(viewing);
                  setShowForm(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  archive(viewing.id);
                  setViewing(undefined);
                }}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Archive className="size-3.5" />
                Archive
              </button>
              <button
                onClick={() => {
                  remove(viewing.id);
                  setViewing(undefined);
                }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit form */}
      {showForm && (
        <TaskForm
          existing={editing}
          onSubmit={editing ? handleEdit : handleCreate}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
    </DashboardLayout>
  );
}
