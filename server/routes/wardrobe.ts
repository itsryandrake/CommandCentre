import { Router, Request, Response } from "express";
import {
  listWardrobe,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
} from "../db/wardrobe.ts";

const router = Router();

// GET /api/wardrobe
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, brand, colour, size } = req.query;
    const items = await listWardrobe(
      category as string | undefined,
      brand as string | undefined,
      colour as string | undefined,
      size as string | undefined
    );
    res.json(items);
  } catch (error) {
    console.error("[Wardrobe] Error listing items:", error);
    res.status(500).json({ error: "Failed to list wardrobe items" });
  }
});

// POST /api/wardrobe
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    if (!name?.trim() || !category) {
      return res.status(400).json({ error: "name and category are required" });
    }
    const item = await createWardrobeItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error("[Wardrobe] Error creating item:", error);
    res.status(500).json({ error: "Failed to create wardrobe item" });
  }
});

// PATCH /api/wardrobe/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const item = await updateWardrobeItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    console.error("[Wardrobe] Error updating item:", error);
    res.status(500).json({ error: "Failed to update wardrobe item" });
  }
});

// DELETE /api/wardrobe/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteWardrobeItem(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    console.error("[Wardrobe] Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete wardrobe item" });
  }
});

export default router;
