import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";
import { scrapeUrl } from "../../server/lib/scraper.ts";
import { categorise } from "../../server/lib/categorise.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body || {};
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

    if (error) return res.status(500).json({ error: error.message });

    if (scraped.imageUrl && data) {
      try {
        const imageResponse = await fetch(scraped.imageUrl);
        if (imageResponse.ok) {
          const buffer = Buffer.from(await imageResponse.arrayBuffer());
          const ext =
            scraped.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || "jpg";
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

    return res.status(201).json({
      id: data.id,
      url: data.url,
      title: data.title,
      price: data.price,
      description: data.description,
      imageUrl: data.image_url,
      category: data.category,
      domain: data.domain,
      createdAt: data.created_at,
    });
  } catch (error: any) {
    console.error("[VisionBoard] Error scraping/creating item:", error);
    return res.status(500).json({ error: "Failed to scrape URL" });
  }
}
