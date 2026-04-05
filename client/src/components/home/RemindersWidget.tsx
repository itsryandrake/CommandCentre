import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Reminder, CreateReminderInput } from "@shared/types/reminder";

interface RemindersWidgetProps {
  reminders: Reminder[];
  isLoading?: boolean;
  onAdd: (input: CreateReminderInput) => Promise<Reminder | null>;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function getPriorityColour(priority: string) {
  switch (priority) {
    case "high":
      return "text-destructive";
    case "low":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}

export function RemindersWidget({
  reminders,
  isLoading,
  onAdd,
  onToggle,
  onDelete,
}: RemindersWidgetProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAdd({
      title: title.trim(),
      priority,
      due_date: dueDate || undefined,
    });

    setTitle("");
    setPriority("normal");
    setDueDate("");
    setDialogOpen(false);
  };

  const incomplete = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Reminders</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse text-muted-foreground">Loading reminders...</div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Reminders</GlassCardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <Plus className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="What do you need to remember?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "normal" | "high")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!title.trim()}>
                Add Reminder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </GlassCardHeader>
      <GlassCardContent>
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-center">
            <CheckCircle2 className="size-8 mb-2 opacity-50" />
            <p className="text-sm">No reminders</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Incomplete reminders */}
            {incomplete.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 group"
              >
                <button
                  onClick={() => onToggle(reminder.id, true)}
                  className="shrink-0"
                >
                  <Circle className="size-4 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{reminder.title}</div>
                  <div className="flex items-center gap-2 text-xs">
                    {reminder.priority === "high" && (
                      <span className={`flex items-center gap-0.5 ${getPriorityColour(reminder.priority)}`}>
                        <AlertCircle className="size-3" />
                        High
                      </span>
                    )}
                    {reminder.due_date && (
                      <span className="text-muted-foreground">{reminder.due_date}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(reminder.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}

            {/* Completed reminders (show last 3) */}
            {completed.length > 0 && (
              <>
                <div className="border-t border-border/50 mt-2 pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Completed</div>
                </div>
                {completed.slice(0, 3).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-2 p-2 rounded-lg opacity-50 group"
                  >
                    <button
                      onClick={() => onToggle(reminder.id, false)}
                      className="shrink-0"
                    >
                      <CheckCircle2 className="size-4 text-primary" />
                    </button>
                    <span className="text-sm line-through truncate flex-1">
                      {reminder.title}
                    </span>
                    <button
                      onClick={() => onDelete(reminder.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
