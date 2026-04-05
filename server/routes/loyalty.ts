import { Router, Request, Response } from "express";
import { listPrograms, updateProgram, seedProgramsIfEmpty } from "../db/loyalty.ts";

const router = Router();

let seeded = false;

// GET /api/loyalty
router.get("/", async (_req: Request, res: Response) => {
  try {
    if (!seeded) {
      await seedProgramsIfEmpty();
      seeded = true;
    }
    const programs = await listPrograms();
    res.json(programs);
  } catch (error) {
    console.error("[Loyalty] Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch loyalty programs" });
  }
});

// PATCH /api/loyalty/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points, statusTier, memberNumber } = req.body;

    const fields: Record<string, any> = {};
    if (points !== undefined) fields.points = points;
    if (statusTier !== undefined) fields.status_tier = statusTier;
    if (memberNumber !== undefined) fields.member_number = memberNumber;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const program = await updateProgram(id, fields);
    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }
    res.json(program);
  } catch (error) {
    console.error("[Loyalty] Error updating program:", error);
    res.status(500).json({ error: "Failed to update program" });
  }
});

export default router;
