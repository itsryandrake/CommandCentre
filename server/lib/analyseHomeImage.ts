import { ALL_TAGS, DREAMHOME_TAG_GROUPS } from "../../shared/types/dreamHome.ts";
import type { DreamHomeImageTag } from "../../shared/types/dreamHome.ts";

export interface AnalysisResult {
  tags: DreamHomeImageTag[];
  description: string;
  isFloorplan: boolean;
}

const TAG_TAXONOMY_TEXT = Object.entries(DREAMHOME_TAG_GROUPS)
  .map(([group, tags]) => `${group}: ${(tags as readonly string[]).join(", ")}`)
  .join("\n");

const SYSTEM_PROMPT = `You are an architectural and interior design image analyst.
Analyse this real estate / home design image and classify it.

If the image is a floor plan, site plan, map, or architectural diagram — return:
{ "isFloorplan": true, "tags": [], "description": "Floor plan" }

Otherwise classify using ONLY these tags:

${TAG_TAXONOMY_TEXT}

RULES:
- Pick 1 Rooms tag and 0-1 Design tags
- Each tag must be EXACTLY from the taxonomy above (case-sensitive)
- Include a confidence score from 0.0 to 1.0 for each tag
- Only return tags you are genuinely confident about (confidence > 0.5)
- Write a brief one-line description of what the image shows

Return valid JSON:
{
  "isFloorplan": false,
  "tags": [{ "tag": "Kitchen", "confidence": 0.95 }, { "tag": "Contemporary", "confidence": 0.8 }],
  "description": "A spacious contemporary kitchen with white cabinetry and timber accents"
}`;

export async function analyseHomeImage(
  imageUrl: string
): Promise<AnalysisResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[DreamHome] OpenAI API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageUrl, detail: "low" },
                },
                {
                  type: "text",
                  text: "Analyse this image and return the classification tags as JSON.",
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      console.error("[DreamHome] OpenAI API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as {
      tags?: { tag: string; confidence: number }[];
      description?: string;
      isFloorplan?: boolean;
    };

    if (parsed.isFloorplan) {
      return { tags: [], description: "Floor plan", isFloorplan: true };
    }

    // Validate tags against taxonomy
    const validTags = (parsed.tags || []).filter(
      (t) =>
        ALL_TAGS.includes(t.tag as any) &&
        typeof t.confidence === "number" &&
        t.confidence > 0.5
    ) as DreamHomeImageTag[];

    return {
      tags: validTags,
      description: parsed.description || "Home design image",
      isFloorplan: false,
    };
  } catch (error) {
    console.error("[DreamHome] AI analysis failed:", error);
    return null;
  }
}

/** Analyse multiple images in batches to avoid rate limits */
export async function analyseHomeImageBatch(
  imageUrls: string[],
  onProgress?: (done: number) => void
): Promise<Map<string, AnalysisResult | null>> {
  const results = new Map<string, AnalysisResult | null>();
  const BATCH_SIZE = 5;

  for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
    const batch = imageUrls.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((url) => analyseHomeImage(url))
    );

    batch.forEach((url, idx) => {
      results.set(url, batchResults[idx]);
    });

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, imageUrls.length));
    }
  }

  return results;
}
