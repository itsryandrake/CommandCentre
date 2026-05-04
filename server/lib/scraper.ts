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

function currencySymbol(code: string | undefined): string {
  switch (code) {
    case "AUD": return "A$";
    case "USD": return "$";
    case "GBP": return "£";
    case "EUR": return "€";
    default: return code ? `${code} ` : "$";
  }
}

function flattenJsonLdNodes(parsed: any): any[] {
  const nodes: any[] = [];
  const visit = (n: any) => {
    if (!n) return;
    if (Array.isArray(n)) { n.forEach(visit); return; }
    if (typeof n !== "object") return;
    nodes.push(n);
    if (n["@graph"]) visit(n["@graph"]);
  };
  visit(parsed);
  return nodes;
}

function isProductNode(node: any): boolean {
  const t = node?.["@type"];
  if (typeof t === "string") return t === "Product";
  if (Array.isArray(t)) return t.includes("Product");
  return false;
}

function pickImage(image: any, baseUrl: string): string | null {
  let raw: string | null = null;
  if (typeof image === "string") raw = image;
  else if (Array.isArray(image) && image.length) {
    const first = image[0];
    raw = typeof first === "string" ? first : first?.url ?? null;
  } else if (image && typeof image === "object") {
    raw = image.url ?? image.contentUrl ?? null;
  }
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return null;
  }
}

function pickOffer(offers: any): any | null {
  if (!offers) return null;
  if (Array.isArray(offers)) return offers[0] ?? null;
  if (typeof offers === "object") return offers;
  return null;
}

function pickPrice(offers: any): string | null {
  const offer = pickOffer(offers);
  if (!offer) return null;
  const raw = offer.price ?? offer.lowPrice ?? offer.priceSpecification?.price;
  if (raw === undefined || raw === null || raw === "") return null;
  return `${currencySymbol(offer.priceCurrency || offer.priceSpecification?.priceCurrency)} ${raw}`;
}

function extractJsonLdProduct($: cheerio.CheerioAPI, url: string): ScrapeResult | null {
  const nodes: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).contents().text();
    if (!text) return;
    try {
      nodes.push(...flattenJsonLdNodes(JSON.parse(text)));
    } catch {
      // some sites have multiple JSON objects in one block — try one more parse pass
      try {
        nodes.push(...flattenJsonLdNodes(JSON.parse(`[${text}]`)));
      } catch {
        // ignore
      }
    }
  });

  const product = nodes.find(isProductNode);
  if (!product) return null;

  const title = typeof product.name === "string" ? product.name.trim() : null;
  if (!title) return null;

  return {
    title,
    price: pickPrice(product.offers),
    description:
      typeof product.description === "string" ? product.description.trim() : null,
    imageUrl: pickImage(product.image, url),
    domain: getDomain(url),
  };
}

async function scrapeWithJsonLd(url: string): Promise<ScrapeResult | null> {
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
    return extractJsonLdProduct($, url);
  } catch (error) {
    console.error("JSON-LD scrape failed:", error);
    return null;
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
        "html",
      ],
      waitFor: 3000,
    });

    if (!result) return null;

    // Prefer JSON-LD from the rendered HTML — most retailers inject Product schema
    // after JS hydration, so the rendered DOM has it even when the raw HTML doesn't.
    if (result.html) {
      const $ = cheerio.load(result.html);
      const jsonLd = extractJsonLdProduct($, url);
      if (jsonLd) return jsonLd;
    }

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
  // 1. JSON-LD Product schema — most accurate when present (covers most major retailers)
  const jsonLdResult = await scrapeWithJsonLd(url);
  if (jsonLdResult) return jsonLdResult;

  // 2. Firecrawl — handles JS-rendered pages without server-side schema
  const firecrawlResult = await scrapeWithFirecrawl(url);
  if (firecrawlResult) return firecrawlResult;

  // 3. og-tags / generic HTML fallback
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
