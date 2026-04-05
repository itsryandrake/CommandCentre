import { useState, useEffect } from "react";
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalCategory, GoalAssignedTo, GoalStatus } from "@shared/types/goal";
import { GOAL_CATEGORIES } from "@shared/types/goal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateNextStep } from "@/lib/api";
import { Sparkles, Loader2 } from "lucide-react";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onSave: (input: CreateGoalInput | UpdateGoalInput) => Promise<void>;
  year: number;
}

export function GoalDialog({ open, onOpenChange, goal, onSave, year }: GoalDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("personal");
  const [description, setDescription] = useState("");
  const [desiredFeeling, setDesiredFeeling] = useState("");
  const [assignedTo, setAssignedTo] = useState<GoalAssignedTo>("both");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<GoalStatus>("active");
  const [cost, setCost] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [nextStepDue, setNextStepDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCategory(goal.category);
      setDescription(goal.description || "");
      setDesiredFeeling(goal.desired_feeling || "");
      setAssignedTo(goal.assigned_to);
      setTargetDate(goal.target_date || "");
      setStatus(goal.status);
      setCost(goal.cost != null ? String(goal.cost) : "");
      setNextStep(goal.next_step || "");
      setNextStepDue(goal.next_step_due || "");
    } else {
      setTitle("");
      setCategory("personal");
      setDescription("");
      setDesiredFeeling("");
      setAssignedTo("both");
      setTargetDate("");
      setStatus("active");
      setCost("");
      setNextStep("");
      setNextStepDue("");
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const costNum = cost ? parseFloat(cost) : undefined;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        desired_feeling: desiredFeeling.trim() || undefined,
        assigned_to: assignedTo,
        target_date: targetDate || undefined,
        year,
        cost: costNum,
        next_step: nextStep.trim() || undefined,
        next_step_due: nextStepDue || undefined,
        ...(isEditing ? { status } : {}),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAISuggest = async () => {
    if (!goal) return;
    setGenerating(true);
    try {
      const suggestion = await generateNextStep(goal.id);
      if (suggestion) {
        setNextStep(suggestion);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Goal" : "Add Goal"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this goal." : "Set a new goal for the family."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_CATEGORIES).map(([key, { label, emoji }]) => (
                  <SelectItem key={key} value={key}>
                    {emoji} {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail about this goal..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">How we wish to feel</label>
            <Textarea
              value={desiredFeeling}
              onChange={(e) => setDesiredFeeling(e.target.value)}
              placeholder="Describe the emotional intention behind this goal..."
              rows={2}
              className="border-amber-warm/30 focus-visible:ring-amber-warm/40 bg-amber-warm/5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned to</label>
            <div className="flex gap-2">
              {(["ryan", "emily", "both"] as GoalAssignedTo[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={assignedTo === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssignedTo(value)}
                  className="flex-1 capitalize"
                >
                  {value === "both" ? "Both" : value === "ryan" ? "Ryan" : "Emily"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target date</label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Next step</label>
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleAISuggest}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                  AI Suggest
                </Button>
              )}
            </div>
            <Textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="What's the very next action?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Next step due</label>
            <Input
              type="date"
              value={nextStepDue}
              onChange={(e) => setNextStepDue(e.target.value)}
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
