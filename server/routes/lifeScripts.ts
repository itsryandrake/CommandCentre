import { Router, Request, Response } from "express";
import { getScript, upsertScript, listVersions, restoreVersion } from "../db/lifeScripts.ts";

const router = Router();

// GET /api/life-scripts/:owner — Get script for ryan or emily
router.get("/:owner", async (req: Request, res: Response) => {
  try {
    const { owner } = req.params;
    if (owner !== "ryan" && owner !== "emily") {
      return res.status(400).json({ error: "owner must be ryan or emily" });
    }
    const script = await getScript(owner);
    res.json(script);
  } catch (error) {
    console.error("[LifeScripts] Error getting:", error);
    res.status(500).json({ error: "Failed to get life script" });
  }
});

// PUT /api/life-scripts/:owner — Create or update script
router.put("/:owner", async (req: Request, res: Response) => {
  try {
    const { owner } = req.params;
    if (owner !== "ryan" && owner !== "emily") {
      return res.status(400).json({ error: "owner must be ryan or emily" });
    }
    const script = await upsertScript(owner, req.body);
    res.json(script);
  } catch (error) {
    console.error("[LifeScripts] Error upserting:", error);
    res.status(500).json({ error: "Failed to update life script" });
  }
});

// GET /api/life-scripts/:owner/versions — List version history
router.get("/:owner/versions", async (req: Request, res: Response) => {
  try {
    const { owner } = req.params;
    const script = await getScript(owner);
    if (!script) return res.json([]);
    const versions = await listVersions(script.id);
    res.json(versions);
  } catch (error) {
    console.error("[LifeScripts] Error listing versions:", error);
    res.status(500).json({ error: "Failed to list versions" });
  }
});

// POST /api/life-scripts/:owner/restore/:versionId — Restore a previous version
router.post("/:owner/restore/:versionId", async (req: Request, res: Response) => {
  try {
    const { owner, versionId } = req.params;
    const script = await getScript(owner);
    if (!script) return res.status(404).json({ error: "Script not found" });
    const restored = await restoreVersion(script.id, versionId);
    if (!restored) return res.status(404).json({ error: "Version not found" });
    res.json(restored);
  } catch (error) {
    console.error("[LifeScripts] Error restoring:", error);
    res.status(500).json({ error: "Failed to restore version" });
  }
});

export default router;
