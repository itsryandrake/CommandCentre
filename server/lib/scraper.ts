import FirecrawlApp from "@mendable/firecrawl-js";
import * as cheerio from "cheerio";
import type { ScrapeResult } from "../../shared/types/visionBoard.ts";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function scrapeWithFirecrawl(
  url: string
): Promise<ScrapeResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  try {
    const firecrawl = new FirecrawlApp({ apiKey });

    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          prompt:
            'Extract the main product or item name as "title", its price with currency symbol as "price", a short one-sentence description as "description", and the primary product image URL (full absolute URL) as "imageUrl".',
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              price: { type: "string" },
              description: { type: "string" },
              imageUrl: { type: "string" },
            },
            required: ["title"],
          },
        },
      ],
    });

    if (!result) return null;

    const json = result.json as {
      title?: string;
      price?: string;
      description?: string;
      imageUrl?: string;
    } | null;

    const metadata = result.metadata;
    const title =
      json?.title || metadata?.ogTitle || metadata?.title;

    if (!title) return null;

    return {
      title,
      price: json?.price || null,
      description:
        json?.description ||
        metadata?.ogDescription ||
        metadata?.description ||
        null,
      imageUrl: json?.imageUrl || metadata?.ogImage || null,
      domain: getDomain(url),
    };
  } catch (error) {
    console.error("Firecrawl scrape failed:", error);
    return null;
  }
}

async function scrapeWithCheerio(
  url: string
): Promise<ScrapeResult | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      $("h1").first().text().trim();

    if (!title) return null;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      null;

    let imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('[itemprop="image"]').attr("src") ||
      $('[itemprop="image"]').attr("content") ||
      null;

    if (imageUrl && !imageUrl.startsWith("http")) {
      try {
        imageUrl = new URL(imageUrl, url).href;
      } catch {
        imageUrl = null;
      }
    }

    let price: string | null = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      if (price) return;
      try {
        const data = JSON.parse($(el).html() || "");
        const offer = data.offers || data;
        if (offer.price) {
          const currency = offer.priceCurrency || "$";
          price = `${currency === "AUD" ? "A$" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency} ${offer.price}`;
        }
      } catch {
        // ignore parse errors
      }
    });

    if (!price) {
      const priceEl = $('[itemprop="price"]');
      if (priceEl.length) {
        price = priceEl.attr("content") || priceEl.text().trim() || null;
      }
    }

    if (!price) {
      const bodyText = $("body").text();
      const priceMatch = bodyText.match(
        /(?:A?\$|£|€|¥)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/
      );
      if (priceMatch) {
        price = priceMatch[0];
      }
    }

    return {
      title,
      price,
      description,
      imageUrl,
      domain: getDomain(url),
    };
  } catch (error) {
    console.error("Cheerio scrape failed:", error);
    return null;
  }
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const firecrawlResult = await scrapeWithFirecrawl(url);
  if (firecrawlResult) return firecrawlResult;

  const cheerioResult = await scrapeWithCheerio(url);
  if (cheerioResult) return cheerioResult;

  return {
    title: getDomain(url),
    price: null,
    description: null,
    imageUrl: null,
    domain: getDomain(url),
  };
}
