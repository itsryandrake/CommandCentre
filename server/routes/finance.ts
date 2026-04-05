import { Router, Request, Response } from "express";
import {
  listProperties,
  createProperty,
  updateProperty,
  listLoans,
  createLoan,
  updateLoan,
  deleteLoan,
} from "../db/finance.ts";

const router = Router();

// Properties
router.get("/properties", async (_req: Request, res: Response) => {
  try {
    const properties = await listProperties();
    res.json(properties);
  } catch (error) {
    console.error("[Finance] Error listing properties:", error);
    res.status(500).json({ error: "Failed to list properties" });
  }
});

router.post("/properties", async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "name and type are required" });
    }
    const property = await createProperty(req.body);
    res.status(201).json(property);
  } catch (error) {
    console.error("[Finance] Error creating property:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
});

router.patch("/properties/:id", async (req: Request, res: Response) => {
  try {
    const property = await updateProperty(req.params.id, req.body);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    console.error("[Finance] Error updating property:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
});

// Loans
router.get("/loans", async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.query;
    const loans = await listLoans(propertyId as string | undefined);
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
