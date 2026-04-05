import { Router, Request, Response } from "express";
import db from "../db/index.ts";
import type { Reminder, CreateReminderInput } from "../../shared/types/reminder.ts";

const router = Router();

// GET /api/reminders
router.get("/", (_req: Request, res: Response) => {
  try {
    const rows = db
      .prepare(
        "SELECT * FROM reminders ORDER BY completed ASC, due_date ASC, created_at DESC"
      )
      .all() as Array<Record<string, any>>;

    const reminders: Reminder[] = rows.map((row) => ({
      ...row,
      completed: Boolean(row.completed),
    })) as Reminder[];

    res.json(reminders);
  } catch (error) {
    console.error("[Reminders] Error fetching reminders:", error);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

// POST /api/reminders
router.post("/", (req: Request, res: Response) => {
  try {
    const input: CreateReminderInput = req.body;

    if (!input.title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = db
      .prepare(
        `INSERT INTO reminders (title, description, due_date, due_time, priority, family_member)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.title.trim(),
        input.description || null,
        input.due_date || null,
        input.due_time || null,
        input.priority || "normal",
        input.family_member || null
      );

    const reminder = db
      .prepare("SELECT * FROM reminders WHERE id = ?")
      .get(result.lastInsertRowid) as Record<string, any>;

    res.status(201).json({ ...reminder, completed: Boolean(reminder.completed) });
  } catch (error) {
    console.error("[Reminders] Error creating reminder:", error);
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

// PATCH /api/reminders/:id
router.patch("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.prepare("SELECT * FROM reminders WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    // Handle completion toggle
    if (typeof updates.completed === "boolean") {
      db.prepare(
        "UPDATE reminders SET completed = ?, completed_at = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(updates.completed ? 1 : 0, updates.completed ? new Date().toISOString() : null, id);
    }

    // Handle other field updates
    const allowedFields = ["title", "description", "due_date", "due_time", "priority", "family_member"];
    for (const field of allowedFields) {
      if (field in updates) {
        db.prepare(`UPDATE reminders SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`).run(
          updates[field],
          id
        );
      }
    }

    const updated = db.prepare("SELECT * FROM reminders WHERE id = ?").get(id) as Record<string, any>;
    res.json({ ...updated, completed: Boolean(updated.completed) });
  } catch (error) {
    console.error("[Reminders] Error updating reminder:", error);
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

// DELETE /api/reminders/:id
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM reminders WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Reminders] Error deleting reminder:", error);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

export default router;
