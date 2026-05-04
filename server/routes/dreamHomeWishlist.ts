import { Router, Request, Response } from "express";
import { getSupabase } from "../db/supabase.ts";
import { scrapeUrl } from "../lib/scraper.ts";
import { categoriseRoom, parsePrice } from "../lib/categoriseRoom.ts";
import type {
  WishlistItem,
  UpdateWishlistInput,
} from "../../shared/types/dreamHomeWishlist.ts";

const router = Router();
const TABLE = "dreamhome_wishlist";
const BUCKET = "dreamhome-images";
const STORAGE_PREFIX = "wishlist/";

const FAILED_TITLE_RE =
  /^(Blocked Page|Access Denied|Forbidden|Just a moment|Attention Required|Are you human|Captcha|Page not found|404|Sign in|Log in|Verifying you are human|Product Name Placeholder|Sample Product|Untitled Product|Loading)\b/i;
const FAILED_TITLE_CONTAINS_RE = /\bplaceholder\b|\blorem ipsum\b/i;
const FAILED_DESC_RE =
  /blocked by .*extension|please complete the security|access to this page|verify you are human|captcha|^this is (a|the|some) sample|sample (product )?description|\blorem ipsum\b|\bplaceholder text\b/i;

const SLUG_STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "new", "sale", "buy",
  "online", "best", "top", "free", "shipping", "shop", "store",
  "gen", "ver", "version", "model", "series", "size",
  "builtin", "built", "in", "out",
  "com", "au", "uk", "us", "html", "htm", "php", "aspx",
]);

function urlSlugTokens(url: string): string[] {
  try {
    const u = new URL(url);
    const path = u.pathname;

    // Try /p/{slug}, /product/{slug}, etc. first
    let slug: string | null = null;
    const m = path.match(
      /\/(?:p|product|products|item|items|listing|prod)\/([^/?#]+)/i
    );
    if (m) slug = m[1];

    // Fallback: last path segment if it looks like a hyphenated slug.
    // Catches Temple & Webster (/Bali-3-Seater-Sofa-AURUM7232.html),
    // Bunnings (/dyson-v15-detect-cordless-vacuum_p0188077), etc.
    if (!slug) {
      const segments = path.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last.includes("-") && last.length > 8) {
        slug = last.replace(/\.(html?|php|aspx?)$/i, "");
      }
    }

    if (!slug) return [];
    return slug
      .split(/[-_.]+/)
      .map((t) => t.toLowerCase())
      .filter((t) => t.length > 2 && !SLUG_STOPWORDS.has(t));
  } catch {
    return [];
  }
}

function titleMissesUrlSlug(url: string, title: string): boolean {
  const tokens = urlSlugTokens(url);
  if (tokens.length < 3) return false; // not enough signal
  const titleLower = title.toLowerCase();
  return tokens.every((t) => !titleLower.includes(t));
}

function looksLikeFailedScrape(
  url: string,
  title: string,
  description: string | null
): boolean {
  if (FAILED_TITLE_RE.test(title)) return true;
  if (FAILED_TITLE_CONTAINS_RE.test(title)) return true;
  if (description && FAILED_DESC_RE.test(description)) return true;
  if (titleMissesUrlSlug(url, title)) return true;
  return false;
}

function dbToItem(row: any): WishlistItem {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    domain: row.domain,
    title: row.title,
    description: row.description,
    price: row.price !== null ? Number(row.price) : null,
    room: row.room,
    priority: row.priority,
    status: row.status,
    quantity: row.quantity,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const camelToSnake: Record<keyof UpdateWishlistInput, string> = {
  title: "title",
  description: "description",
  imageUrl: "image_url",
  sourceUrl: "source_url",
  price: "price",
  room: "room",
  priority: "priority",
  status: "status",
  quantity: "quantity",
  notes: "notes",
};

function patchToDb(patch: UpdateWishlistInput): Record<string, any> {
  const updates: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    const dbKey = camelToSnake[key as keyof UpdateWishlistInput];
    if (dbKey) updates[dbKey] = value;
  }
  if (Object.keys(updates).length > 0) updates.updated_at = new Date().toISOString();
  return updates;
}

// GET /api/dream-home-wishlist — list items, optional ?room= and ?status= filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
    if (req.query.room) query = query.eq("room", String(req.query.room));
    if (req.query.status) query = query.eq("status", String(req.query.status));
    const { data, error } = await query;
    if (error) throw error;
    res.json((data || []).map(dbToItem));
  } catch (error) {
    console.error("[Wishlist] Fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// POST /api/dream-home-wishlist/scrape — scrape URL and create item
router.post("/scrape", async (req: Request, res: Response) => {
  try {
    const { url, force } = req.body || {};
    if (!url?.trim()) return res.status(400).json({ error: "URL is required" });

    const scraped = await scrapeUrl(url.trim());

    if (!force && looksLikeFailedScrape(url.trim(), scraped.title, scraped.description)) {
      return res.status(422).json({
        error: "Failed to scrape that URL — the page returned a blocked, placeholder, or template response.",
      });
    }

    const room = categoriseRoom(scraped.title, scraped.description, scraped.domain);
    const price = parsePrice(scraped.price);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        source_url: url.trim(),
        title: scraped.title,
        description: scraped.description,
        image_url: scraped.imageUrl,
        domain: scraped.domain,
        price,
        room,
      })
      .select()
      .single();

    if (error) throw error;

    if (scraped.imageUrl && data) {
      try {
        const imageResponse = await fetch(scraped.imageUrl);
        if (imageResponse.ok) {
          const buffer = Buffer.from(await imageResponse.arrayBuffer());
          const ext = scraped.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || "jpg";
          const storagePath = `${STORAGE_PREFIX}${data.id}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buffer, {
              contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
            await supabase
              .from(TABLE)
              .update({ image_url: publicUrl.publicUrl })
              .eq("id", data.id);
            data.image_url = publicUrl.publicUrl;
          }
        }
      } catch (imgError) {
        console.error("[Wishlist] Image upload failed (non-fatal):", imgError);
      }
    }

    res.status(201).json(dbToItem(data));
  } catch (error) {
    console.error("[Wishlist] Scrape failed:", error);
    res.status(500).json({ error: "Failed to scrape URL" });
  }
});

// PATCH /api/dream-home-wishlist/:id — inline edit any field
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = patchToDb(req.body || {});
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json(dbToItem(data));
  } catch (error) {
    console.error("[Wishlist] Update failed:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /api/dream-home-wishlist/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data: item } = await supabase
      .from(TABLE)
      .select("image_url")
      .eq("id", id)
      .single();

    if (item?.image_url?.includes(`${BUCKET}/${STORAGE_PREFIX}`)) {
      const path = item.image_url.split(`${BUCKET}/`).pop();
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      }
    }

    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error("[Wishlist] Delete failed:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// POST /api/dream-home-wishlist/bulk/delete — bulk delete by ids[]
router.post("/bulk/delete", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids[] is required" });
    }
    const supabase = getSupabase();

    const { data: items } = await supabase.from(TABLE).select("image_url").in("id", ids);
    const paths =
      (items || [])
        .map((i: any) => i.image_url as string | null)
        .filter((u): u is string => !!u && u.includes(`${BUCKET}/${STORAGE_PREFIX}`))
        .map((u) => u.split(`${BUCKET}/`).pop()!)
        .filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths).catch(() => {});
    }

    const { error } = await supabase.from(TABLE).delete().in("id", ids);
    if (error) throw error;
    res.json({ ok: true, deleted: ids.length });
  } catch (error) {
    console.error("[Wishlist] Bulk delete failed:", error);
    res.status(500).json({ error: "Failed to bulk delete" });
  }
});

export default router;
