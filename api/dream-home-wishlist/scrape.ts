import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.js";
import { scrapeUrl } from "../../server/lib/scraper.js";
import { categoriseRoom, parsePrice } from "../../server/lib/categoriseRoom.js";

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

    let slug: string | null = null;
    const m = path.match(
      /\/(?:p|product|products|item|items|listing|prod)\/([^/?#]+)/i
    );
    if (m) slug = m[1];

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
  if (tokens.length < 3) return false;
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

function dbToItem(row: any) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, force } = req.body || {};
    if (!url?.trim()) {
      return res.status(400).json({ error: "URL is required" });
    }

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

    if (error) return res.status(500).json({ error: error.message });

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

    return res.status(201).json(dbToItem(data));
  } catch (error: any) {
    console.error("[Wishlist] Scrape error:", error);
    return res.status(500).json({ error: "Failed to scrape URL" });
  }
}
