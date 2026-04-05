import type { DocumentAnalysis } from "../../shared/types/document.ts";

const SYSTEM_PROMPT = `You are a document analysis assistant for an Australian household.
Analyse this document and extract key information. Return valid JSON with these fields:
- category: one of "insurance", "tax", "utility", "warranty", "council", "vehicle", "medical", "financial", "other"
- subcategory: specific type e.g. "electricity", "home insurance", "car registration", "income tax"
- documentTitle: a clear, short title for this document
- provider: the company or issuer name
- policyNumber: any policy, account, or reference number
- issueDate: in YYYY-MM-DD format if found
- expiryDate: expiry or renewal date in YYYY-MM-DD format if found
- amount: the primary dollar amount as a number (no currency symbol)
- amountLabel: what the amount represents e.g. "annual premium", "quarterly bill", "total due"
- keyDetails: object of other notable extracted info as key-value string pairs
- aiSummary: one sentence summary of the document

Only include fields you can confidently extract. Use YYYY-MM-DD for dates. Return only valid JSON.`;

async function bufferToBase64DataUrl(
  buffer: Buffer,
  mimeType: string
): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function pdfToImages(buffer: Buffer): Promise<string[]> {
  try {
    const { pdf } = await import("pdf-to-img");
    const images: string[] = [];
    let pageCount = 0;

    for await (const page of await pdf(buffer, { scale: 2 })) {
      if (pageCount >= 3) break;
      const pageBuffer = Buffer.from(page);
      images.push(await bufferToBase64DataUrl(pageBuffer, "image/png"));
      pageCount++;
    }

    return images;
  } catch (error) {
    console.error("[Documents] PDF conversion failed:", error);
    return [];
  }
}

export async function analyseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[Documents] OpenAI API key not configured");
    return null;
  }

  // Build image content parts
  const imageUrls: string[] = [];

  if (mimeType === "application/pdf") {
    const pages = await pdfToImages(buffer);
    if (pages.length === 0) return null;
    imageUrls.push(...pages);
  } else {
    // Image file — send directly
    imageUrls.push(await bufferToBase64DataUrl(buffer, mimeType));
  }

  const contentParts: any[] = imageUrls.map((url) => ({
    type: "image_url",
    image_url: { url, detail: "high" },
  }));

  contentParts.push({
    type: "text",
    text: "Analyse this document and extract the key information as JSON.",
  });

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
            { role: "user", content: contentParts },
          ],
          max_tokens: 1000,
          temperature: 0,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      console.error("[Documents] OpenAI API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as DocumentAnalysis;
    return parsed;
  } catch (error) {
    console.error("[Documents] AI analysis failed:", error);
    return null;
  }
}
