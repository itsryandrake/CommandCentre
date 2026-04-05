import { Router, Request, Response } from "express";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listAttachments,
  addAttachment,
  deleteAttachment,
} from "../db/tasks.ts";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, assigned, archived } = req.query;
    const tasks = await listTasks({
      status: status as string | undefined,
      assignedTo: assigned as string | undefined,
      archived: archived === "true" ? true : archived === "false" ? false : undefined,
    });
    res.json(tasks);
  } catch (error) {
    console.error("[Tasks] Error listing:", error);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    const task = await createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    console.error("[Tasks] Error creating:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const task = await updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    console.error("[Tasks] Error updating:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteTask(req.params.id);
    if (!success) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("[Tasks] Error deleting:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Attachments
router.get("/:id/attachments", async (req: Request, res: Response) => {
  try {
    const attachments = await listAttachments(req.params.id);
    res.json(attachments);
  } catch (error) {
    console.error("[Tasks] Error listing attachments:", error);
    res.status(500).json({ error: "Failed to list attachments" });
  }
});

router.post("/:id/attachments", async (req: Request, res: Response) => {
  try {
    const { fileName, fileUrl } = req.body;
    if (!fileName || !fileUrl) return res.status(400).json({ error: "fileName and fileUrl are required" });
    const attachment = await addAttachment(req.params.id, req.body);
    res.status(201).json(attachment);
  } catch (error) {
    console.error("[Tasks] Error adding attachment:", error);
    res.status(500).json({ error: "Failed to add attachment" });
  }
});

router.delete("/attachments/:attachmentId", async (req: Request, res: Response) => {
  try {
    const success = await deleteAttachment(req.params.attachmentId);
    if (!success) return res.status(404).json({ error: "Attachment not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("[Tasks] Error deleting attachment:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export default router;
