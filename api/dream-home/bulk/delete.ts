import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageIds } = req.body || {};
  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return res.status(400).json({ error: "imageIds must be a non-empty array" });
  }

  const supabase = getSupabase();

  const { data: images } = await supabase
    .from("dreamhome_images")
    .select("id, image_url")
    .in("id", imageIds);

  if (images && images.length > 0) {
    const storagePaths = images
      .filter((img: any) => img.image_url?.includes("dreamhome-images"))
      .map((img: any) => img.image_url.split("dreamhome-images/").pop())
      .filter(Boolean);

    if (storagePaths.length > 0) {
      await supabase.storage
        .from("dreamhome-images")
        .remove(storagePaths)
        .catch(() => {});
    }
  }

  const { error } = await supabase
    .from("dreamhome_images")
    .delete()
    .in("id", imageIds);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, deleted: images?.length || 0 });
}
