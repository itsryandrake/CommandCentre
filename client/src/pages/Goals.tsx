import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GoalDialog } from "@/components/goals/GoalDialog";
import { GoalReviewDialog } from "@/components/goals/GoalReviewDialog";
import { YearHero } from "@/components/goals/YearHero";
import { CategoryIntention } from "@/components/goals/CategoryIntention";
import { useGoals } from "@/hooks/useGoals";
import { useGoalYear } from "@/hooks/useGoalYear";
import type { Goal, GoalAssignedTo, CreateGoalInput, UpdateGoalInput } from "@shared/types/goal";
import { GOAL_CATEGORIES } from "@shared/types/goal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Calendar,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

export function Goals() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { goals, isLoading, add, update, remove } = useGoals(selectedYear);
  const { yearData, intentions, updateYear, updateIntention } = useGoalYear(selectedYear);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [assignedFilter, setAssignedFilter] = useState<GoalAssignedTo | "all">("all");
  const [activeTab, setActiveTab] = useState("all");
  const [reviewGoal, setReviewGoal] = useState<Goal | null>(null);

  const filteredGoals = useMemo(() => {
    let filtered = goals;
    if (assignedFilter !== "all") {
      filtered = filtered.filter(
        (g) => g.assigned_to === assignedFilter || g.assigned_to === "both"
      );
    }
    if (activeTab !== "all") {
      filtered = filtered.filter((g) => g.category === activeTab);
    }
    return filtered;
  }, [goals, assignedFilter, activeTab]);

  const activeGoals = filteredGoals.filter((g) => g.status === "active");
  const completedGoals = filteredGoals.filter((g) => g.status === "completed");
  const pausedGoals = filteredGoals.filter((g) => g.status === "paused");

  const costTotal = filteredGoals.reduce((sum, g) => sum + (g.cost || 0), 0);

  const handleSave = async (input: CreateGoalInput | UpdateGoalInput) => {
    if (editingGoal) {
      await update(editingGoal.id, input as UpdateGoalInput);
    } else {
      await add({ ...input as CreateGoalInput, year: selectedYear });
    }
  };

  const openCreate = () => {
    setEditingGoal(null);
    setDialogOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const toggleComplete = async (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";
    await update(goal.id, { status: newStatus });
  };

  const assignedLabel = (value: GoalAssignedTo) => {
    if (value === "ryan") return "Ryan";
    if (value === "emily") return "Emily";
    return "Both";
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-sage">Completed</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  const getIntentionForCategory = (category: string) => {
    const found = intentions.find((i) => i.category === category);
    return found?.intention || "";
  };

  const renderGoalCard = (goal: Goal) => (
    <GlassCard key={goal.id} className="group">
      <GlassCardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${goal.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                {goal.title}
              </h3>
              {statusBadge(goal.status)}
              <Badge variant="outline" className="text-xs">
                {assignedLabel(goal.assigned_to)}
              </Badge>
            </div>

            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}

            {goal.desired_feeling && (
              <div className="flex items-start gap-1.5 text-sm">
                <Heart className="size-3.5 mt-0.5 text-amber-warm shrink-0" />
                <span className="italic text-amber-warm">
                  {goal.desired_feeling}
                </span>
              </div>
            )}

            {goal.cost != null && goal.cost > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="size-3" />
                <span>${goal.cost.toLocaleString("en-AU")}</span>
              </div>
            )}

            {goal.next_step && (
              <div className="flex items-start gap-1.5 text-sm">
                <ArrowRight className="size-3.5 mt-0.5 text-blue-500 shrink-0" />
                <span className="text-muted-foreground">
                  {goal.next_step}
                  {goal.next_step_due && (
                    <span className="text-xs ml-1.5 opacity-60">
                      (by {new Date(goal.next_step_due).toLocaleDateString("en-AU", { day: "numeric", month: "short" })})
                    </span>
                  )}
                </span>
              </div>
            )}

            {goal.target_date && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                <span>
                  {new Date(goal.target_date).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setReviewGoal(goal)}
              title="Quarterly reviews"
            >
              <MessageSquare className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => toggleComplete(goal)}
              title={goal.status === "completed" ? "Reactivate" : "Complete"}
            >
              {goal.status === "completed" ? (
                <RotateCcw className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => openEdit(goal)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive"
              onClick={() => remove(goal.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );

  const renderGoalSection = (title: string, sectionGoals: Goal[]) => {
    if (sectionGoals.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="space-y-2">
          {sectionGoals.map(renderGoalCard)}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Goals">
      <div className="space-y-6">
        {/* Header with Year Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setSelectedYear((y) => y - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <h1 className="text-3xl font-bold tabular-nums">{selectedYear}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setSelectedYear((y) => y + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <p className="text-muted-foreground hidden sm:block">Dreamstorming</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Year Hero */}
        <YearHero year={selectedYear} yearData={yearData} onUpdate={updateYear} />

        {/* Person filter */}
        <div className="flex gap-2">
          {(["all", "ryan", "emily", "both"] as const).map((value) => (
            <Badge
              key={value}
              variant={assignedFilter === value ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => setAssignedFilter(value)}
            >
              {value === "all" ? "Everyone" : value === "both" ? "Shared" : value === "ryan" ? "Ryan" : "Emily"}
            </Badge>
          ))}
        </div>

        {/* Category tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(GOAL_CATEGORIES).map(([key, { label, emoji }]) => (
              <TabsTrigger key={key} value={key}>
                {emoji} {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {activeTab !== "all" && (
                <CategoryIntention
                  year={selectedYear}
                  category={activeTab}
                  intention={getIntentionForCategory(activeTab)}
                  onSave={updateIntention}
                />
              )}

              {filteredGoals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No goals yet. Create one to get started.</p>
                </div>
              ) : (
                <>
                  {renderGoalSection("Active", activeGoals)}
                  {renderGoalSection("Paused", pausedGoals)}
                  {renderGoalSection("Completed", completedGoals)}

                  {costTotal > 0 && (
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <DollarSign className="size-3.5" />
                      <span>Total estimated cost: <strong className="text-foreground">${costTotal.toLocaleString("en-AU")}</strong></span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Tabs>
      </div>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editingGoal}
        onSave={handleSave}
        year={selectedYear}
      />

      {reviewGoal && (
        <GoalReviewDialog
          open={!!reviewGoal}
          onOpenChange={(open) => { if (!open) setReviewGoal(null); }}
          goalId={reviewGoal.id}
          goalTitle={reviewGoal.title}
          year={selectedYear}
        />
      )}
    </DashboardLayout>
  );
}
