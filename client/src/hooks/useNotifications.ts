import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { fetchTasks } from "@/lib/api";
import { fetchEquipment } from "@/lib/api";
import type { Task } from "@shared/types/task";
import type { Equipment } from "@shared/types/equipment";
import type { FamilyUser } from "@/context/UserContext";

export type NotificationType = "task-overdue" | "warranty-expiring" | "service-due";
export type NotificationSeverity = "warning" | "critical";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  severity: NotificationSeverity;
  href: string;
}

const STORAGE_PREFIX = "notifications_dismissed_";

function getDismissedKey(user: FamilyUser): string {
  return `${STORAGE_PREFIX}${user}`;
}

function readDismissed(user: FamilyUser): string[] {
  try {
    const raw = localStorage.getItem(getDismissedKey(user));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDismissed(user: FamilyUser, ids: string[]): void {
  localStorage.setItem(getDismissedKey(user), JSON.stringify(ids));
}

const INACTIVE_STATUSES = ["retired", "sold", "donated", "thrown_out"];

function computeNotifications(
  tasks: Task[],
  equipment: Equipment[],
  user: FamilyUser
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Overdue tasks
  for (const task of tasks) {
    if (task.status === "done" || task.isArchived || !task.dueDate) continue;
    if (task.assignedTo && task.assignedTo !== "both" && task.assignedTo !== user) continue;

    const due = new Date(task.dueDate);
    if (due >= today) continue;

    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
    notifications.push({
      id: `task-overdue-${task.id}`,
      type: "task-overdue",
      title: `Overdue: ${task.title}`,
      description: `${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue`,
      date: task.dueDate,
      severity: "critical",
      href: "/family/tasks",
    });
  }

  // Warranty expiring (within 30 days or up to 90 days past)
  for (const item of equipment) {
    if (!item.warrantyExpiry || INACTIVE_STATUSES.includes(item.status)) continue;

    const expiry = new Date(item.warrantyExpiry);
    const daysUntil = Math.floor((expiry.getTime() - today.getTime()) / 86_400_000);
    if (daysUntil > 30 || daysUntil < -90) continue;

    notifications.push({
      id: `warranty-${item.id}`,
      type: "warranty-expiring",
      title: `Warranty: ${item.name}`,
      description:
        daysUntil < 0
          ? `Expired ${Math.abs(daysUntil)} days ago`
          : daysUntil === 0
            ? "Expires today"
            : `Expires in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
      date: item.warrantyExpiry,
      severity: daysUntil <= 7 ? "critical" : "warning",
      href: "/home/equipment",
    });
  }

  // Service due (within 14 days or up to 30 days past)
  for (const item of equipment) {
    if (!item.nextServiceDue || INACTIVE_STATUSES.includes(item.status)) continue;

    const serviceDue = new Date(item.nextServiceDue);
    const daysUntil = Math.floor((serviceDue.getTime() - today.getTime()) / 86_400_000);
    if (daysUntil > 14 || daysUntil < -30) continue;

    notifications.push({
      id: `service-${item.id}`,
      type: "service-due",
      title: `Service due: ${item.name}`,
      description:
        daysUntil < 0
          ? `${Math.abs(daysUntil)} days overdue`
          : daysUntil === 0
            ? "Due today"
            : `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
      date: item.nextServiceDue,
      severity: daysUntil <= 0 ? "critical" : "warning",
      href: "/home/equipment",
    });
  }

  // Sort: critical first, then by date ascending
  notifications.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return notifications;
}

export function useNotifications() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [t, e] = await Promise.all([
        fetchTasks(false),
        fetchEquipment(),
      ]);
      if (!cancelled) {
        setTasks(t);
        setEquipment(e);
        setLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Load dismissed IDs when user changes
  useEffect(() => {
    if (!user) {
      setDismissedIds(new Set());
      return;
    }
    setDismissedIds(new Set(readDismissed(user)));
  }, [user]);

  const allNotifications = useMemo(() => {
    if (!user || !loaded) return [];
    return computeNotifications(tasks, equipment, user);
  }, [tasks, equipment, user, loaded]);

  const notifications = useMemo(
    () => allNotifications.filter((n) => !dismissedIds.has(n.id)),
    [allNotifications, dismissedIds]
  );

  const dismiss = useCallback(
    (id: string) => {
      if (!user) return;
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        // Prune stale IDs
        const activeIds = new Set(allNotifications.map((n) => n.id));
        const pruned = [...next].filter((d) => activeIds.has(d) || d === id);
        writeDismissed(user, pruned);
        return new Set(pruned);
      });
    },
    [user, allNotifications]
  );

  const clearAll = useCallback(() => {
    if (!user) return;
    const allIds = allNotifications.map((n) => n.id);
    setDismissedIds(new Set(allIds));
    writeDismissed(user, allIds);
  }, [user, allNotifications]);

  return { notifications, count: notifications.length, dismiss, clearAll };
}
