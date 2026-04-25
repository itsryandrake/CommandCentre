import { Router, Request, Response } from "express";
import multer from "multer";
import { getSupabase } from "../db/supabase.ts";
import {
  scrapeListingImages,
  isDirectImageUrl,
} from "../lib/dreamhomeScraper.ts";
import {
  analyseHomeImage,
  analyseHomeImageBatch,
} from "../lib/analyseHomeImage.ts";
import type {
  DreamHomeImage,
  DreamHomeScrapeJob,
} from "../../shared/types/dreamHome.ts";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

// In-memory job tracking
const jobs = new Map<string, DreamHomeScrapeJob>();

function dbToImage(row: any, tags: any[] = []): DreamHomeImage {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    originalImageUrl: row.original_image_url,
    title: row.title,
    notes: row.notes,
    sourceDomain: row.source_domain,
    aiDescription: row.ai_description,
    tags: tags.map((t: any) => ({ tag: t.tag, confidence: t.confidence })),
    createdAt: row.created_at,
  };
}

async function uploadImageToStorage(
  imageUrl: string,
  imageId: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const ext =
      imageUrl.match(/\.(jpe?g|png|webp|gif|avif)/i)?.[1] || "jpg";
    const storagePath = `${imageId}.${ext === "jpeg" ? "jpg" : ext}`;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from("dreamhome-images")
      .upload(storagePath, buffer, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: true,
      });

    if (error) {
      console.error("[DreamHome] Storage upload error:", error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("dreamhome-images")
      .getPublicUrl(storagePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("[DreamHome] Image upload failed:", error);
    return null;
  }
}

async function processAndSaveImage(
  originalImageUrl: string,
  sourceUrl: string | null,
  title: string | null,
  sourceDomain: string | null
): Promise<DreamHomeImage | null> {
  const supabase = getSupabase();

  // Check for duplicates
  const { data: existing } = await supabase
    .from("dreamhome_images")
    .select("id")
    .eq("original_image_url", originalImageUrl)
    .limit(1);

  if (existing && existing.length > 0) return null;

  // Insert the image record first to get an ID
  const { data: row, error: insertError } = await supabase
    .from("dreamhome_images")
    .insert({
      source_url: sourceUrl,
      image_url: originalImageUrl, // temporary — will update after storage upload
      original_image_url: originalImageUrl,
      title,
      source_domain: sourceDomain,
    })
    .select()
    .single();

  if (insertError || !row) {
    console.error("[DreamHome] Insert error:", insertError);
    return null;
  }

  // Upload to storage
  const storageUrl = await uploadImageToStorage(originalImageUrl, row.id);
  if (storageUrl) {
    await supabase
      .from("dreamhome_images")
      .update({ image_url: storageUrl })
      .eq("id", row.id);
    row.image_url = storageUrl;
  }

  // AI analysis
  const analysis = await analyseHomeImage(storageUrl || originalImageUrl);
  if (analysis) {
    // Skip floorplans — delete the record we just inserted
    if (analysis.isFloorplan) {
      if (storageUrl) {
        const path = storageUrl.split("dreamhome-images/").pop();
        if (path) await supabase.storage.from("dreamhome-images").remove([path]).catch(() => {});
      }
      await supabase.from("dreamhome_images").delete().eq("id", row.id);
      return null;
    }

    await supabase
      .from("dreamhome_images")
      .update({ ai_description: analysis.description })
      .eq("id", row.id);
    row.ai_description = analysis.description;

    // Insert tags
    if (analysis.tags.length > 0) {
      const tagRows = analysis.tags.map((t) => ({
        image_id: row.id,
        tag: t.tag,
        confidence: t.confidence,
      }));
      await supabase.from("dreamhome_image_tags").insert(tagRows);
    }

    return dbToImage(row, analysis.tags);
  }

  return dbToImage(row);
}

async function processUploadedFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<DreamHomeImage | null> {
  const supabase = getSupabase();

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";

  const { data: row, error: insertError } = await supabase
    .from("dreamhome_images")
    .insert({
      source_url: null,
      image_url: "",
      original_image_url: null,
      title: originalName.replace(/\.[^.]+$/, ""),
      source_domain: null,
    })
    .select()
    .single();

  if (insertError || !row) {
    console.error("[DreamHome] Insert error:", insertError);
    return null;
  }

  const storagePath = `${row.id}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("dreamhome-images")
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error("[DreamHome] Storage upload error:", uploadError);
    await supabase.from("dreamhome_images").delete().eq("id", row.id);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("dreamhome-images")
    .getPublicUrl(storagePath);

  const storageUrl = publicUrl.publicUrl;
  await supabase
    .from("dreamhome_images")
    .update({ image_url: storageUrl })
    .eq("id", row.id);
  row.image_url = storageUrl;

  const analysis = await analyseHomeImage(storageUrl);
  if (analysis) {
    if (analysis.isFloorplan) {
      await supabase.storage.from("dreamhome-images").remove([storagePath]).catch(() => {});
      await supabase.from("dreamhome_images").delete().eq("id", row.id);
      return null;
    }

    await supabase
      .from("dreamhome_images")
      .update({ ai_description: analysis.description })
      .eq("id", row.id);
    row.ai_description = analysis.description;

    if (analysis.tags.length > 0) {
      const tagRows = analysis.tags.map((t) => ({
        image_id: row.id,
        tag: t.tag,
        confidence: t.confidence,
      }));
      await supabase.from("dreamhome_image_tags").insert(tagRows);
    }

    return dbToImage(row, analysis.tags);
  }

  return dbToImage(row);
}

// GET /api/dream-home — fetch all images with tags
router.get("/", async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const tagsFilter = req.query.tags
      ? (req.query.tags as string).split(",")
      : null;

    let query = supabase
      .from("dreamhome_images")
      .select("*, dreamhome_image_tags(tag, confidence)")
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let images = (data || []).map((row: any) =>
      dbToImage(row, row.dreamhome_image_tags || [])
    );

    // Filter by tags (AND logic — image must have ALL requested tags)
    if (tagsFilter && tagsFilter.length > 0) {
      images = images.filter((img) => {
        const imageTags = img.tags.map((t) => t.tag);
        return tagsFilter.every((t) => imageTags.includes(t));
      });
    }

    res.json(images);
  } catch (error) {
    console.error("[DreamHome] Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch dream home images" });
  }
});

// GET /api/dream-home/tags — get all tags with counts
router.get("/tags", async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("dreamhome_image_tags")
      .select("tag");

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.tag] = (counts[row.tag] || 0) + 1;
    }

    const tagCounts = Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.json(tagCounts);
  } catch (error) {
    console.error("[DreamHome] Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// POST /api/dream-home/scrape — scrape a listing URL (async job)
router.post("/scrape", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url?.trim()) {
      return res.status(400).json({ error: "URL is required" });
    }

    const trimmedUrl = url.trim();

    // If it's a direct image URL, process immediately
    if (isDirectImageUrl(trimmedUrl)) {
      const image = await processAndSaveImage(trimmedUrl, null, null, null);
      if (!image) {
        return res.status(400).json({ error: "Failed to process image" });
      }
      return res.status(201).json({
        status: "complete",
        progress: { total: 1, done: 1 },
        images: [image],
      } satisfies DreamHomeScrapeJob);
    }

    // For listing URLs, start background processing
    const jobId = crypto.randomUUID();
    const job: DreamHomeScrapeJob = {
      status: "processing",
      progress: { total: 0, done: 0 },
      images: [],
    };
    jobs.set(jobId, job);

    res.status(202).json({ jobId });

    // Background processing
    (async () => {
      try {
        const listing = await scrapeListingImages(trimmedUrl);
        if (listing.imageUrls.length === 0) {
          job.status = "error";
          job.error = "No images found on this page";
          return;
        }

        job.progress.total = listing.imageUrls.length;

        // Process images in batches
        const BATCH_SIZE = 5;
        for (let i = 0; i < listing.imageUrls.length; i += BATCH_SIZE) {
          const batch = listing.imageUrls.slice(i, i + BATCH_SIZE);
          const results = await Promise.all(
            batch.map((imgUrl) =>
              processAndSaveImage(
                imgUrl,
                trimmedUrl,
                listing.title,
                listing.domain
              )
            )
          );

          for (const image of results) {
            if (image) job.images.push(image);
          }
          job.progress.done = Math.min(
            i + BATCH_SIZE,
            listing.imageUrls.length
          );
        }

        job.status = "complete";
      } catch (error) {
        console.error("[DreamHome] Background scrape error:", error);
        job.status = "error";
        job.error = "Scraping failed unexpectedly";
      }
    })();
  } catch (error) {
    console.error("[DreamHome] Error starting scrape:", error);
    res.status(500).json({ error: "Failed to start scraping" });
  }
});

// GET /api/dream-home/scrape/status/:jobId — poll job progress
router.get("/scrape/status/:jobId", (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);

  // Clean up completed jobs after they're read
  if (job.status === "complete" || job.status === "error") {
    setTimeout(() => jobs.delete(req.params.jobId), 60_000);
  }
});

// POST /api/dream-home/image — add a single direct image URL
router.post("/image", async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl?.trim()) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const image = await processAndSaveImage(imageUrl.trim(), null, null, null);
    if (!image) {
      return res.status(400).json({ error: "Failed to process image" });
    }

    res.status(201).json(image);
  } catch (error) {
    console.error("[DreamHome] Error adding image:", error);
    res.status(500).json({ error: "Failed to add image" });
  }
});

// POST /api/dream-home/upload — upload image files directly
router.post("/upload", upload.any(), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const jobId = crypto.randomUUID();
    const job: DreamHomeScrapeJob = {
      status: "processing",
      progress: { total: files.length, done: 0 },
      images: [],
    };
    jobs.set(jobId, job);

    res.status(202).json({ jobId });

    (async () => {
      const BATCH_SIZE = 5;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map((file) =>
            processUploadedFile(file.buffer, file.originalname, file.mimetype)
          )
        );

        for (const image of results) {
          if (image) job.images.push(image);
        }
        job.progress.done = Math.min(i + BATCH_SIZE, files.length);
      }
      job.status = "complete";
    })();
  } catch (error) {
    console.error("[DreamHome] Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// PATCH /api/dream-home/:id — update title/notes
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, notes } = req.body;

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("dreamhome_images")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error("[DreamHome] Error updating image:", error);
    res.status(500).json({ error: "Failed to update image" });
  }
});

// PATCH /api/dream-home/:id/tags — replace tags for an image
router.patch("/:id/tags", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "tags must be an array" });
    }

    const supabase = getSupabase();

    // Delete existing tags
    await supabase.from("dreamhome_image_tags").delete().eq("image_id", id);

    // Insert new tags
    if (tags.length > 0) {
      const tagRows = tags.map((tag: string) => ({
        image_id: id,
        tag,
        confidence: 1.0, // manual tags get full confidence
      }));
      const { error } = await supabase
        .from("dreamhome_image_tags")
        .insert(tagRows);
      if (error) throw error;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("[DreamHome] Error updating tags:", error);
    res.status(500).json({ error: "Failed to update tags" });
  }
});

// DELETE /api/dream-home/:id — delete an image
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    // Get image to clean up storage
    const { data: item } = await supabase
      .from("dreamhome_images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (item?.image_url?.includes("dreamhome-images")) {
      try {
        const path = item.image_url.split("dreamhome-images/").pop();
        if (path) {
          await supabase.storage.from("dreamhome-images").remove([path]);
        }
      } catch {
        // non-fatal
      }
    }

    // Tags cascade-deleted via FK
    const { error } = await supabase
      .from("dreamhome_images")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error("[DreamHome] Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
