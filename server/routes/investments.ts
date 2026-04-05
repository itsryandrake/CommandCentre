import { Router, Request, Response } from "express";
import {
  listInvestments, getInvestmentWithDetails, createInvestment, updateInvestment, deleteInvestment,
  addPayment, updatePayment, deletePayment,
  addDocument, deleteDocument,
  addInvestmentTask, updateInvestmentTask, deleteInvestmentTask,
} from "../db/investments.ts";

const router = Router();

// Investments
router.get("/", async (_req: Request, res: Response) => {
  try { res.json(await listInvestments()); }
  catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to list investments" }); }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const inv = await getInvestmentWithDetails(req.params.id);
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json(inv);
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to get investment" }); }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: "name is required" });
    res.status(201).json(await createInvestment(req.body));
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to create investment" }); }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const inv = await updateInvestment(req.params.id, req.body);
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json(inv);
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to update investment" }); }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!await deleteInvestment(req.params.id)) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to delete investment" }); }
});

// Payments
router.post("/:id/payments", async (req: Request, res: Response) => {
  try {
    if (!req.body.label || !req.body.amountLocal) return res.status(400).json({ error: "label and amountLocal required" });
    res.status(201).json(await addPayment(req.params.id, req.body));
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to add payment" }); }
});

router.patch("/payments/:paymentId", async (req: Request, res: Response) => {
  try {
    const p = await updatePayment(req.params.paymentId, req.body);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to update payment" }); }
});

router.delete("/payments/:paymentId", async (req: Request, res: Response) => {
  try {
    if (!await deletePayment(req.params.paymentId)) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to delete payment" }); }
});

// Documents
router.post("/:id/documents", async (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.fileUrl) return res.status(400).json({ error: "name and fileUrl required" });
    res.status(201).json(await addDocument(req.params.id, req.body));
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to add document" }); }
});

router.delete("/documents/:docId", async (req: Request, res: Response) => {
  try {
    if (!await deleteDocument(req.params.docId)) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to delete document" }); }
});

// Tasks
router.post("/:id/tasks", async (req: Request, res: Response) => {
  try {
    if (!req.body.title) return res.status(400).json({ error: "title required" });
    res.status(201).json(await addInvestmentTask(req.params.id, req.body));
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to add task" }); }
});

router.patch("/tasks/:taskId", async (req: Request, res: Response) => {
  try {
    const t = await updateInvestmentTask(req.params.taskId, req.body);
    if (!t) return res.status(404).json({ error: "Not found" });
    res.json(t);
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to update task" }); }
});

router.delete("/tasks/:taskId", async (req: Request, res: Response) => {
  try {
    if (!await deleteInvestmentTask(req.params.taskId)) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (e) { console.error("[Investments]", e); res.status(500).json({ error: "Failed to delete task" }); }
});

export default router;
