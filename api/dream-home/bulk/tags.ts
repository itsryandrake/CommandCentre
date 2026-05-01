import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageIds, addTags, removeTags } = req.body || {};
  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return res.status(400).json({ error: "imageIds must be a non-empty array" });
  }

  const supabase = getSupabase();

  if (Array.isArray(removeTags) && removeTags.length > 0) {
    await supabase
      .from("dreamhome_image_tags")
      .delete()
      .in("image_id", imageIds)
      .in("tag", removeTags);
  }

  if (Array.isArray(addTags) && addTags.length > 0) {
    const tagRows = imageIds.flatMap((id: string) =>
      addTags.map((tag: string) => ({
        image_id: id,
        tag,
        confidence: 1.0,
      }))
    );
    const { error } = await supabase
      .from("dreamhome_image_tags")
      .upsert(tagRows, { onConflict: "image_id,tag" });
    if (error) return res.status(500).json({ error: error.message });
  }

  return res.json({ ok: true });
}
