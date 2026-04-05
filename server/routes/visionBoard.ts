import { Router, Request, Response } from "express";
import { getSupabase } from "../db/supabase.ts";
import { scrapeUrl } from "../lib/scraper.ts";
import { categorise } from "../lib/categorise.ts";
import type { VisionBoardItem } from "../../shared/types/visionBoard.ts";

const router = Router();

function dbToItem(row: any): VisionBoardItem {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    domain: row.domain,
    createdAt: row.created_at,
  };
}

// GET /api/vision-board — fetch all items
router.get("/", async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("futureframe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json((data || []).map(dbToItem));
  } catch (error) {
    console.error("[VisionBoard] Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch vision board items" });
  }
});

// POST /api/vision-board/scrape — scrape a URL and create an item
router.post("/scrape", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url?.trim()) {
      return res.status(400).json({ error: "URL is required" });
    }

    const scraped = await scrapeUrl(url.trim());
    const category = categorise(scraped.title, scraped.description, scraped.domain);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("futureframe_items")
      .insert({
        url: url.trim(),
        title: scraped.title,
        price: scraped.price,
        description: scraped.description,
        image_url: scraped.imageUrl,
        category,
        domain: scraped.domain,
      })
      .select()
      .single();

    if (error) throw error;

    // If we have an image URL, try to upload it to Supabase storage
    if (scraped.imageUrl && data) {
      try {
        const imageResponse = await fetch(scraped.imageUrl);
        if (imageResponse.ok) {
          const buffer = Buffer.from(await imageResponse.arrayBuffer());
          const ext = scraped.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || "jpg";
          const storagePath = `${data.id}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("futureframe-images")
            .upload(storagePath, buffer, {
              contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrl } = supabase.storage
              .from("futureframe-images")
              .getPublicUrl(storagePath);

            await supabase
              .from("futureframe_items")
              .update({ image_url: publicUrl.publicUrl })
              .eq("id", data.id);

            data.image_url = publicUrl.publicUrl;
          }
        }
      } catch (imgError) {
        console.error("[VisionBoard] Image upload failed (non-fatal):", imgError);
      }
    }

    res.status(201).json(dbToItem(data));
  } catch (error) {
    console.error("[VisionBoard] Error scraping/creating item:", error);
    res.status(500).json({ error: "Failed to scrape URL" });
  }
});

// PATCH /api/vision-board/:id — update category or price
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, price } = req.body;

    const updates: Record<string, any> = {};
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = price;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("futureframe_items")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error("[VisionBoard] Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /api/vision-board/:id — delete an item
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    // Get item first to clean up storage
    const { data: item } = await supabase
      .from("futureframe_items")
      .select("image_url")
      .eq("id", id)
      .single();

    // Delete the image from storage if it's in our bucket
    if (item?.image_url?.includes("futureframe-images")) {
      try {
        const path = item.image_url.split("futureframe-images/").pop();
        if (path) {
          await supabase.storage.from("futureframe-images").remove([path]);
        }
      } catch {
        // non-fatal
      }
    }

    const { error } = await supabase
      .from("futureframe_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error("[VisionBoard] Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
