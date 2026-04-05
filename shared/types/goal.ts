export type GoalCategory =
  | "personal"
  | "health_wellness"
  | "money_finances"
  | "business"
  | "play_adventure"
  | "faith_contribution"
  | "family";

export type GoalAssignedTo = "ryan" | "emily" | "both";

export type GoalStatus = "active" | "completed" | "paused" | "archived";

export type GoalQuarter = "Q1" | "Q2" | "Q3" | "Q4";

export interface Goal {
  id: number;
  title: string;
  description?: string;
  category: GoalCategory;
  desired_feeling?: string;
  assigned_to: GoalAssignedTo;
  status: GoalStatus;
  sort_order: number;
  target_date?: string;
  completed_at?: string;
  year: number;
  cost?: number;
  next_step?: string;
  next_step_due?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  title: string;
  category: GoalCategory;
  description?: string;
  desired_feeling?: string;
  assigned_to?: GoalAssignedTo;
  target_date?: string;
  year?: number;
  cost?: number;
  next_step?: string;
  next_step_due?: string;
}

export interface UpdateGoalInput {
  title?: string;
  category?: GoalCategory;
  description?: string;
  desired_feeling?: string;
  assigned_to?: GoalAssignedTo;
  status?: GoalStatus;
  sort_order?: number;
  target_date?: string;
  year?: number;
  cost?: number;
  next_step?: string;
  next_step_due?: string;
}

export interface GoalYear {
  id: number;
  year: number;
  theme?: string;
  purpose?: string;
  outcomes?: string;
  target_monthly_income?: number;
  target_daily_income?: number;
  created_at: string;
  updated_at: string;
}

export interface GoalYearIntention {
  id: number;
  year: number;
  category: GoalCategory;
  intention?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalReview {
  id: number;
  goal_id: number;
  quarter: GoalQuarter;
  year: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateGoalYearInput {
  theme?: string;
  purpose?: string;
  outcomes?: string;
  target_monthly_income?: number;
  target_daily_income?: number;
}

export const GOAL_CATEGORIES: Record<GoalCategory, { label: string; emoji: string }> = {
  personal: { label: "Personal Goals", emoji: "🎯" },
  health_wellness: { label: "Health & Wellness", emoji: "💪" },
  money_finances: { label: "Money & Finances", emoji: "💰" },
  business: { label: "Business", emoji: "📈" },
  play_adventure: { label: "Play & Adventure", emoji: "🏄" },
  faith_contribution: { label: "Faith & Contribution", emoji: "🙏" },
  family: { label: "Family", emoji: "👨‍👩‍👧‍👦" },
};
