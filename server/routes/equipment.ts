import { Router, Request, Response } from "express";
import {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  listNotes,
  addNote,
  deleteNote,
} from "../db/equipment.ts";

const router = Router();

// GET /api/equipment - List equipment
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    const items = await listEquipment(
      category as string | undefined,
      status as string | undefined
    );
    res.json(items);
  } catch (error) {
    console.error("[Equipment] Error listing:", error);
    res.status(500).json({ error: "Failed to list equipment" });
  }
});

// POST /api/equipment/scrape - Scrape product URL for auto-fill
router.post("/scrape", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Fetch the page content
    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!pageResponse.ok) {
      return res.status(400).json({ error: "Could not fetch URL" });
    }

    const html = await pageResponse.text();
    // Take first 8000 chars to keep token usage reasonable
    const truncated = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    // Use OpenAI to extract product info
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Extract product information from the following page content. Return valid JSON with these fields (omit any you can't find): name, brand, model, price (number only, no currency symbol), imageUrl, description (one sentence). Return only the JSON object, no markdown.",
          },
          { role: "user", content: truncated },
        ],
        max_tokens: 500,
        temperature: 0,
      }),
    });

    if (!aiResponse.ok) {
      return res.status(500).json({ error: "Failed to parse product info" });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "{}";

    // Parse JSON, handling potential markdown wrapping
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    res.json(parsed);
  } catch (error) {
    console.error("[Equipment] Error scraping:", error);
    res.status(500).json({ error: "Failed to scrape product info" });
  }
});

// GET /api/equipment/:id - Get single item
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await getEquipment(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("[Equipment] Error getting:", error);
    res.status(500).json({ error: "Failed to get equipment" });
  }
});

// POST /api/equipment - Create
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "name and category are required" });
    }
    const item = await createEquipment(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error("[Equipment] Error creating:", error);
    res.status(500).json({ error: "Failed to create equipment" });
  }
});

// PATCH /api/equipment/:id - Update
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const item = await updateEquipment(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("[Equipment] Error updating:", error);
    res.status(500).json({ error: "Failed to update equipment" });
  }
});

// DELETE /api/equipment/:id - Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteEquipment(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Equipment] Error deleting:", error);
    res.status(500).json({ error: "Failed to delete equipment" });
  }
});

// GET /api/equipment/:id/notes - List notes for equipment
router.get("/:id/notes", async (req: Request, res: Response) => {
  try {
    const notes = await listNotes(req.params.id);
    res.json(notes);
  } catch (error) {
    console.error("[Equipment] Error listing notes:", error);
    res.status(500).json({ error: "Failed to list notes" });
  }
});

// POST /api/equipment/:id/notes - Add note
router.post("/:id/notes", async (req: Request, res: Response) => {
  try {
    const { content, user } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    const note = await addNote(req.params.id, content, user);
    res.status(201).json(note);
  } catch (error) {
    console.error("[Equipment] Error adding note:", error);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// DELETE /api/equipment/notes/:noteId - Delete note
router.delete("/notes/:noteId", async (req: Request, res: Response) => {
  try {
    const success = await deleteNote(req.params.noteId);
    if (!success) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Equipment] Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
