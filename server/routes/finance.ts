import { Router, Request, Response } from "express";
import {
  listAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  listLoans,
  createLoan,
  updateLoan,
  deleteLoan,
} from "../db/finance.ts";

const router = Router();

// Assets
router.get("/assets", async (_req: Request, res: Response) => {
  try {
    const assets = await listAssets();
    res.json(assets);
  } catch (error) {
    console.error("[Finance] Error listing assets:", error);
    res.status(500).json({ error: "Failed to list assets" });
  }
});

router.post("/assets", async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "name and type are required" });
    }
    const asset = await createAsset(req.body);
    res.status(201).json(asset);
  } catch (error) {
    console.error("[Finance] Error creating asset:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

router.patch("/assets/:id", async (req: Request, res: Response) => {
  try {
    const asset = await updateAsset(req.params.id, req.body);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(asset);
  } catch (error) {
    console.error("[Finance] Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

router.delete("/assets/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteAsset(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Finance] Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// Loans
router.get("/loans", async (req: Request, res: Response) => {
  try {
    const { assetId } = req.query;
    const loans = await listLoans(assetId as string | undefined);
    res.json(loans);
  } catch (error) {
    console.error("[Finance] Error listing loans:", error);
    res.status(500).json({ error: "Failed to list loans" });
  }
});

router.post("/loans", async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "name and type are required" });
    }
    const loan = await createLoan(req.body);
    res.status(201).json(loan);
  } catch (error) {
    console.error("[Finance] Error creating loan:", error);
    res.status(500).json({ error: "Failed to create loan" });
  }
});

router.patch("/loans/:id", async (req: Request, res: Response) => {
  try {
    const loan = await updateLoan(req.params.id, req.body);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json(loan);
  } catch (error) {
    console.error("[Finance] Error updating loan:", error);
    res.status(500).json({ error: "Failed to update loan" });
  }
});

router.delete("/loans/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteLoan(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Finance] Error deleting loan:", error);
    res.status(500).json({ error: "Failed to delete loan" });
  }
});

export default router;
