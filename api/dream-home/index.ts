import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();

  if (req.method === "GET") {
    const tagsFilter = req.query.tags
      ? (req.query.tags as string).split(",")
      : null;

    const { data, error } = await supabase
      .from("dreamhome_images")
      .select("*, dreamhome_image_tags(tag, confidence)")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    let images = (data || []).map((row: any) => ({
      id: row.id,
      sourceUrl: row.source_url,
      imageUrl: row.image_url,
      originalImageUrl: row.original_image_url,
      title: row.title,
      notes: row.notes,
      sourceDomain: row.source_domain,
      aiDescription: row.ai_description,
      tags: (row.dreamhome_image_tags || []).map((t: any) => ({
        tag: t.tag,
        confidence: t.confidence,
      })),
      createdAt: row.created_at,
    }));

    if (tagsFilter && tagsFilter.length > 0) {
      images = images.filter((img: any) => {
        const imageTags = img.tags.map((t: any) => t.tag);
        return tagsFilter.every((t: string) => imageTags.includes(t));
      });
    }

    return res.json(images);
  }

  if (req.method === "PATCH") {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "id is required" });

    const { title, notes } = req.body;
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { error } = await supabase
      .from("dreamhome_images")
      .update(updates)
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "id is required" });

    const { data: item } = await supabase
      .from("dreamhome_images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (item?.image_url?.includes("dreamhome-images")) {
      const path = item.image_url.split("dreamhome-images/").pop();
      if (path) {
        await supabase.storage.from("dreamhome-images").remove([path]).catch(() => {});
      }
    }

    const { error } = await supabase
      .from("dreamhome_images")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
