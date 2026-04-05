import { Router, Request, Response } from "express";
import {
  listShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
} from "../db/shopping.ts";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await listShoppingItems();
    res.json(items);
  } catch (error) {
    console.error("[Shopping] Error listing:", error);
    res.status(500).json({ error: "Failed to list shopping items" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const item = await createShoppingItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error("[Shopping] Error creating:", error);
    res.status(500).json({ error: "Failed to create shopping item" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const item = await updateShoppingItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    console.error("[Shopping] Error updating:", error);
    res.status(500).json({ error: "Failed to update shopping item" });
  }
});

// Delete checked items — must be before /:id to avoid matching "checked" as id
router.delete("/checked", async (_req: Request, res: Response) => {
  try {
    const count = await clearCheckedItems();
    res.json({ success: true, cleared: count });
  } catch (error) {
    console.error("[Shopping] Error clearing checked:", error);
    res.status(500).json({ error: "Failed to clear checked items" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteShoppingItem(req.params.id);
    if (!success) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("[Shopping] Error deleting:", error);
    res.status(500).json({ error: "Failed to delete shopping item" });
  }
});

export default router;
