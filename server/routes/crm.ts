import { Router, Request, Response } from "express";
import {
  fetchContacts,
  fetchContact,
  createContact,
  updateContact,
  deleteContact,
  fetchInteractions,
  createInteraction,
  fetchCrmStats,
} from "../db/crm.ts";

const router = Router();

// =============================================================================
// Contacts
// =============================================================================

// GET /api/crm/contacts
router.get("/contacts", async (_req: Request, res: Response) => {
  try {
    const contacts = await fetchContacts();
    res.json(contacts);
  } catch (error) {
    console.error("[CRM] Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// GET /api/crm/contacts/:id
router.get("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const contact = await fetchContact(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const interactions = await fetchInteractions(req.params.id);
    res.json({ ...contact, interactions });
  } catch (error) {
    console.error("[CRM] Error fetching contact:", error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

// POST /api/crm/contacts
router.post("/contacts", async (req: Request, res: Response) => {
  try {
    const input = req.body;

    if (!input.fullName?.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }

    // Set defaults
    const contactData = {
      ...input,
      fullName: input.fullName.trim(),
      relationshipType: input.relationshipType || "Friend",
      relationshipStrength: input.relationshipStrength ?? 5,
      cadenceDays: input.cadenceDays ?? 30,
      lastSeenDate: input.lastSeenDate || new Date().toISOString(),
      isPinned: input.isPinned ?? false,
      dietary: input.dietary || [],
      loveLanguages: input.loveLanguages || [],
      languages: input.languages || [],
      children: input.children || [],
      pets: input.pets || [],
      friendIds: input.friendIds || [],
      siblingIds: input.siblingIds || [],
      groups: input.groups || [],
      socials: input.socials || {},
    };

    const contact = await createContact(contactData);
    res.status(201).json(contact);
  } catch (error) {
    console.error("[CRM] Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// PATCH /api/crm/contacts/:id
router.patch("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const existing = await fetchContact(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const contact = await updateContact(req.params.id, req.body);
    res.json(contact);
  } catch (error) {
    console.error("[CRM] Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// DELETE /api/crm/contacts/:id
router.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    await deleteContact(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("[CRM] Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// =============================================================================
// Interactions
// =============================================================================

// GET /api/crm/interactions
router.get("/interactions", async (req: Request, res: Response) => {
  try {
    const contactId = req.query.contactId as string | undefined;
    const interactions = await fetchInteractions(contactId);
    res.json(interactions);
  } catch (error) {
    console.error("[CRM] Error fetching interactions:", error);
    res.status(500).json({ error: "Failed to fetch interactions" });
  }
});

// POST /api/crm/interactions
router.post("/interactions", async (req: Request, res: Response) => {
  try {
    const input = req.body;

    if (!input.contactId) {
      return res.status(400).json({ error: "Contact ID is required" });
    }
    if (!input.type) {
      return res.status(400).json({ error: "Interaction type is required" });
    }

    const interaction = await createInteraction({
      contactId: input.contactId,
      date: input.date || new Date().toISOString(),
      type: input.type,
      location: input.location,
      notes: input.notes || "",
    });

    res.status(201).json(interaction);
  } catch (error) {
    console.error("[CRM] Error creating interaction:", error);
    res.status(500).json({ error: "Failed to create interaction" });
  }
});

// =============================================================================
// Stats
// =============================================================================

// GET /api/crm/stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await fetchCrmStats();
    res.json(stats);
  } catch (error) {
    console.error("[CRM] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch CRM stats" });
  }
});

export default router;
