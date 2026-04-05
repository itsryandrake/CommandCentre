import { Router, Request, Response } from "express";
import db from "../db/index.ts";
import type { Goal, CreateGoalInput, GoalYear, GoalYearIntention, GoalReview, GoalQuarter } from "../../shared/types/goal.ts";

const router = Router();

const VALID_QUARTERS: GoalQuarter[] = ["Q1", "Q2", "Q3", "Q4"];

// =========================================================================
// Year routes (MUST be before /:id to avoid matching "years" as an id)
// =========================================================================

// GET /api/goals/years — list all years
router.get("/years", (_req: Request, res: Response) => {
  try {
    // Combine years from goal_years table and goals table
    const yearsFromGoals = db.prepare("SELECT DISTINCT year FROM goals").all() as { year: number }[];
    const yearsFromMeta = db.prepare("SELECT DISTINCT year FROM goal_years").all() as { year: number }[];

    const yearSet = new Set<number>();
    yearsFromGoals.forEach((r) => yearSet.add(r.year));
    yearsFromMeta.forEach((r) => yearSet.add(r.year));

    // Always include current year
    yearSet.add(new Date().getFullYear());

    const years = Array.from(yearSet).sort((a, b) => b - a);
    res.json(years);
  } catch (error) {
    console.error("[Goals] Error fetching years:", error);
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

// GET /api/goals/years/:year — get year metadata
router.get("/years/:year", (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) return res.status(400).json({ error: "Invalid year" });

    const yearData = db.prepare("SELECT * FROM goal_years WHERE year = ?").get(year) as GoalYear | undefined;
    res.json(yearData || { year, theme: null, purpose: null, outcomes: null, target_monthly_income: null, target_daily_income: null });
  } catch (error) {
    console.error("[Goals] Error fetching year:", error);
    res.status(500).json({ error: "Failed to fetch year data" });
  }
});

// PUT /api/goals/years/:year — upsert year metadata
router.put("/years/:year", (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) return res.status(400).json({ error: "Invalid year" });

    const { theme, purpose, outcomes, target_monthly_income, target_daily_income } = req.body;

    db.prepare(`
      INSERT INTO goal_years (year, theme, purpose, outcomes, target_monthly_income, target_daily_income)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(year) DO UPDATE SET
        theme = excluded.theme,
        purpose = excluded.purpose,
        outcomes = excluded.outcomes,
        target_monthly_income = excluded.target_monthly_income,
        target_daily_income = excluded.target_daily_income,
        updated_at = datetime('now')
    `).run(year, theme || null, purpose || null, outcomes || null, target_monthly_income || null, target_daily_income || null);

    const updated = db.prepare("SELECT * FROM goal_years WHERE year = ?").get(year) as GoalYear;
    res.json(updated);
  } catch (error) {
    console.error("[Goals] Error updating year:", error);
    res.status(500).json({ error: "Failed to update year data" });
  }
});

// GET /api/goals/years/:year/intentions — get category intentions for a year
router.get("/years/:year/intentions", (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) return res.status(400).json({ error: "Invalid year" });

    const intentions = db.prepare("SELECT * FROM goal_year_intentions WHERE year = ?").all(year) as GoalYearIntention[];
    res.json(intentions);
  } catch (error) {
    console.error("[Goals] Error fetching intentions:", error);
    res.status(500).json({ error: "Failed to fetch intentions" });
  }
});

// PUT /api/goals/years/:year/intentions/:category — upsert intention
router.put("/years/:year/intentions/:category", (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) return res.status(400).json({ error: "Invalid year" });

    const { category } = req.params;
    const { intention } = req.body;

    db.prepare(`
      INSERT INTO goal_year_intentions (year, category, intention)
      VALUES (?, ?, ?)
      ON CONFLICT(year, category) DO UPDATE SET
        intention = excluded.intention,
        updated_at = datetime('now')
    `).run(year, category, intention || null);

    const updated = db.prepare("SELECT * FROM goal_year_intentions WHERE year = ? AND category = ?").get(year, category) as GoalYearIntention;
    res.json(updated);
  } catch (error) {
    console.error("[Goals] Error updating intention:", error);
    res.status(500).json({ error: "Failed to update intention" });
  }
});

// =========================================================================
// Goal routes
// =========================================================================

// GET /api/goals
router.get("/", (req: Request, res: Response) => {
  try {
    let query = "SELECT * FROM goals";
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // Default to current year if no year specified
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
    conditions.push("year = ?");
    params.push(year);

    if (req.query.category) {
      conditions.push("category = ?");
      params.push(req.query.category as string);
    }
    if (req.query.assigned_to) {
      conditions.push("assigned_to = ?");
      params.push(req.query.assigned_to as string);
    }
    if (req.query.status) {
      conditions.push("status = ?");
      params.push(req.query.status as string);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY sort_order ASC, created_at DESC";

    const goals = db.prepare(query).all(...params) as Goal[];
    res.json(goals);
  } catch (error) {
    console.error("[Goals] Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST /api/goals
router.post("/", (req: Request, res: Response) => {
  try {
    const input: CreateGoalInput = req.body;

    if (!input.title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!input.category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const year = input.year || new Date().getFullYear();

    const result = db
      .prepare(
        `INSERT INTO goals (title, category, description, desired_feeling, assigned_to, target_date, year, cost, next_step, next_step_due)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.title.trim(),
        input.category,
        input.description || null,
        input.desired_feeling || null,
        input.assigned_to || "both",
        input.target_date || null,
        year,
        input.cost ?? null,
        input.next_step || null,
        input.next_step_due || null
      );

    const goal = db
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(result.lastInsertRowid) as Goal;

    res.status(201).json(goal);
  } catch (error) {
    console.error("[Goals] Error creating goal:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// =========================================================================
// Goal-specific sub-routes (reviews, AI) — before /:id
// =========================================================================

// GET /api/goals/:id/reviews
router.get("/:id/reviews", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = db.prepare("SELECT * FROM goal_reviews WHERE goal_id = ? ORDER BY year, quarter").all(id) as GoalReview[];
    res.json(reviews);
  } catch (error) {
    console.error("[Goals] Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// PUT /api/goals/:id/reviews/:quarter
router.put("/:id/reviews/:quarter", (req: Request, res: Response) => {
  try {
    const { id, quarter } = req.params;
    if (!VALID_QUARTERS.includes(quarter as GoalQuarter)) {
      return res.status(400).json({ error: "Invalid quarter. Must be Q1, Q2, Q3, or Q4" });
    }

    const { notes, year } = req.body;
    const reviewYear = year || new Date().getFullYear();

    db.prepare(`
      INSERT INTO goal_reviews (goal_id, quarter, year, notes)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(goal_id, quarter, year) DO UPDATE SET
        notes = excluded.notes,
        updated_at = datetime('now')
    `).run(id, quarter, reviewYear, notes || null);

    const updated = db.prepare(
      "SELECT * FROM goal_reviews WHERE goal_id = ? AND quarter = ? AND year = ?"
    ).get(id, quarter, reviewYear) as GoalReview;

    res.json(updated);
  } catch (error) {
    console.error("[Goals] Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// POST /api/goals/:id/generate-next-step
router.post("/:id/generate-next-step", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = db.prepare("SELECT * FROM goals WHERE id = ?").get(id) as Goal | undefined;

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    }

    const prompt = `You are a helpful goal-setting coach. Given this goal, suggest ONE specific, actionable next step the person should take. Be concise (1-2 sentences max).

Goal: ${goal.title}
Category: ${goal.category.replace("_", " ")}
${goal.description ? `Description: ${goal.description}` : ""}
${goal.desired_feeling ? `Desired feeling: ${goal.desired_feeling}` : ""}
${goal.next_step ? `Current next step: ${goal.next_step}` : ""}

Reply with ONLY the next step, nothing else.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Goals] Anthropic API error:", errorText);
      return res.status(500).json({ error: "Failed to generate next step" });
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const nextStep = data.content?.[0]?.text?.trim() || null;

    if (nextStep) {
      db.prepare("UPDATE goals SET next_step = ?, updated_at = datetime('now') WHERE id = ?").run(nextStep, id);
    }

    res.json({ next_step: nextStep });
  } catch (error) {
    console.error("[Goals] Error generating next step:", error);
    res.status(500).json({ error: "Failed to generate next step" });
  }
});

// PATCH /api/goals/:id
router.patch("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.prepare("SELECT * FROM goals WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Handle status change with completed_at
    if (updates.status) {
      const completedAt = updates.status === "completed" ? new Date().toISOString() : null;
      db.prepare(
        "UPDATE goals SET status = ?, completed_at = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(updates.status, completedAt, id);
    }

    // Handle other field updates
    const allowedFields = [
      "title", "category", "description", "desired_feeling",
      "assigned_to", "sort_order", "target_date",
      "year", "cost", "next_step", "next_step_due",
    ];
    for (const field of allowedFields) {
      if (field in updates) {
        db.prepare(
          `UPDATE goals SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(updates[field] ?? null, id);
      }
    }

    const updated = db.prepare("SELECT * FROM goals WHERE id = ?").get(id) as Goal;
    res.json(updated);
  } catch (error) {
    console.error("[Goals] Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// DELETE /api/goals/:id
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM goals WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Goals] Error deleting goal:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
