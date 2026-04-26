import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  const { tags } = req.body;
  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: "tags must be an array" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  await supabase.from("dreamhome_image_tags").delete().eq("image_id", id);

  if (tags.length > 0) {
    const tagRows = tags.map((tag: string) => ({
      image_id: id,
      tag,
      confidence: 1.0,
    }));
    const { error } = await supabase
      .from("dreamhome_image_tags")
      .insert(tagRows);
    if (error) return res.status(500).json({ error: error.message });
  }

  return res.json({ ok: true });
}
