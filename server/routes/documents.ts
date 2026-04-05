import { Router, Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import { getSupabase } from "../db/supabase.ts";
import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../db/documents.ts";
import { analyseDocument } from "../lib/analyseDocument.ts";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const BUCKET = "household-documents";

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin";
}

// GET /api/documents — list all documents
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const docs = await listDocuments(category as string | undefined);
    res.json(docs);
  } catch (error) {
    console.error("[Documents] Error listing:", error);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

// GET /api/documents/:id — get single document
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const doc = await getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (error) {
    console.error("[Documents] Error getting:", error);
    res.status(500).json({ error: "Failed to get document" });
  }
});

// POST /api/documents/upload — upload a document with AI analysis
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const supabase = getSupabase();
    const ext = getExtension(file.originalname);
    const fileId = crypto.randomUUID();
    const storagePath = `documents/${fileId}.${ext}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Documents] Storage upload failed:", uploadError);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const fileUrl = publicUrlData.publicUrl;

    // Run AI analysis
    const analysis = await analyseDocument(file.buffer, file.mimetype);

    // Save to database
    const doc = await createDocument({
      fileName: file.originalname,
      fileUrl,
      fileType: ext,
      fileSizeBytes: file.size,
      storagePath,
      category: analysis?.category || "other",
      subcategory: analysis?.subcategory,
      documentTitle: analysis?.documentTitle,
      provider: analysis?.provider,
      policyNumber: analysis?.policyNumber,
      issueDate: analysis?.issueDate,
      expiryDate: analysis?.expiryDate,
      amount: analysis?.amount,
      amountLabel: analysis?.amountLabel,
      keyDetails: analysis?.keyDetails,
      aiSummary: analysis?.aiSummary,
      uploadedBy: req.body.uploadedBy,
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error("[Documents] Error uploading:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// PATCH /api/documents/:id — update metadata
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const doc = await updateDocument(req.params.id, req.body);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (error) {
    console.error("[Documents] Error updating:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
});

// DELETE /api/documents/:id — delete document and storage file
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const doc = await getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Remove from storage
    const supabase = getSupabase();
    try {
      await supabase.storage.from(BUCKET).remove([doc.storagePath]);
    } catch {
      // non-fatal if storage cleanup fails
    }

    const success = await deleteDocument(req.params.id);
    if (!success) return res.status(500).json({ error: "Failed to delete document" });

    res.json({ success: true });
  } catch (error) {
    console.error("[Documents] Error deleting:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
