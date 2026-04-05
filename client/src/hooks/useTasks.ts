import { useState, useEffect, useCallback } from "react";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@shared/types/task";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchTasks(!showArchived ? false : undefined);
    setTasks(data);
    setIsLoading(false);
  }, [showArchived]);

  useEffect(() => { load(); }, [load]);

  const add = async (input: CreateTaskInput) => {
    const task = await createTask(input);
    if (task) await load();
    return task;
  };

  const update = async (id: string, input: UpdateTaskInput) => {
    const task = await updateTask(id, input);
    if (task) {
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    }
    return task;
  };

  const remove = async (id: string) => {
    const success = await deleteTask(id);
    if (success) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const archive = async (id: string) => {
    return update(id, { isArchived: true });
  };

  const changeStatus = async (id: string, status: Task["status"]) => {
    return update(id, { status });
  };

  // Group by status
  const todo = tasks.filter((t) => t.status === "todo");
  const doing = tasks.filter((t) => t.status === "doing");
  const delayed = tasks.filter((t) => t.status === "delayed");
  const done = tasks.filter((t) => t.status === "done");

  return {
    tasks, todo, doing, delayed, done,
    isLoading, showArchived, setShowArchived,
    add, update, remove, archive, changeStatus, reload: load,
  };
}
