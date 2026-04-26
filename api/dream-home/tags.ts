import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data, error } = await supabase
    .from("dreamhome_image_tags")
    .select("tag");

  if (error) return res.status(500).json({ error: error.message });

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.tag] = (counts[row.tag] || 0) + 1;
  }

  const tagCounts = Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return res.json(tagCounts);
}
