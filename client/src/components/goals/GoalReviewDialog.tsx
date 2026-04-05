import { useState, useEffect } from "react";
import type { GoalReview, GoalQuarter } from "@shared/types/goal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchGoalReviews, upsertGoalReview } from "@/lib/api";

interface GoalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: number;
  goalTitle: string;
  year: number;
}

const QUARTERS: { key: GoalQuarter; label: string; month: string }[] = [
  { key: "Q1", label: "Q1", month: "March" },
  { key: "Q2", label: "Q2", month: "June" },
  { key: "Q3", label: "Q3", month: "September" },
  { key: "Q4", label: "Q4", month: "December" },
];

export function GoalReviewDialog({ open, onOpenChange, goalId, goalTitle, year }: GoalReviewDialogProps) {
  const [reviews, setReviews] = useState<Record<GoalQuarter, string>>({
    Q1: "", Q2: "", Q3: "", Q4: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && goalId) {
      setLoading(true);
      fetchGoalReviews(goalId).then((data) => {
        const map: Record<GoalQuarter, string> = { Q1: "", Q2: "", Q3: "", Q4: "" };
        data.forEach((r: GoalReview) => {
          if (r.year === year) {
            map[r.quarter] = r.notes || "";
          }
        });
        setReviews(map);
        setLoading(false);
      });
    }
  }, [open, goalId, year]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        QUARTERS.map((q) =>
          upsertGoalReview(goalId, q.key, year, reviews[q.key])
        )
      );
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Quarterly Reviews</DialogTitle>
          <DialogDescription>
            {goalTitle} — {year}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {QUARTERS.map((q) => (
              <div key={q.key} className="space-y-1.5">
                <label className="text-sm font-medium">
                  {q.label} — {q.month}
                </label>
                <Textarea
                  value={reviews[q.key]}
                  onChange={(e) =>
                    setReviews((prev) => ({ ...prev, [q.key]: e.target.value }))
                  }
                  placeholder={`${q.month} review notes...`}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Reviews"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
