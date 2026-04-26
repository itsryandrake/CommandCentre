import { chromium } from "playwright";
import FirecrawlApp from "@mendable/firecrawl-js";
import * as cheerio from "cheerio";
import type { DreamHomeListingScrapeResult } from "../../shared/types/dreamHome.ts";

// Cache image buffers captured during Playwright scraping so we don't
// need to re-download from CDNs that block server-side fetches.
const imageBufferCache = new Map<string, Buffer>();

export function getCachedImageBuffer(url: string): Buffer | undefined {
  const exact = imageBufferCache.get(url);
  if (exact) return exact;

  // Match by reastatic hash — the captured URL might differ in resolution
  const hashMatch = url.match(/([a-f0-9]{64})/);
  if (hashMatch) {
    for (const [cachedUrl, buffer] of imageBufferCache) {
      if (cachedUrl.includes(hashMatch[1])) return buffer;
    }
  }
  return undefined;
}

export function clearImageBufferCache(): void {
  imageBufferCache.clear();
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

export function isDirectImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.test(url);
}

function deduplicateUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((u) => {
    const normalised = u.split("?")[0].toLowerCase();
    if (seen.has(normalised)) return false;
    seen.add(normalised);
    return true;
  });
}

function toAbsoluteUrl(src: string, baseUrl: string): string | null {
  if (!src || src.startsWith("data:")) return null;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

// =============================================================================
// Playwright-based scraper (primary — handles JS-rendered galleries)
// =============================================================================

async function scrapeListingWithPlaywright(
  url: string
): Promise<DreamHomeListingScrapeResult | null> {
  let browser;
  try {
    browser = await chromium.launch({
      channel: "chrome",
      headless: false,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--window-position=9999,9999",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: "en-AU",
      timezoneId: "Australia/Brisbane",
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    const page = await context.newPage();

    // Intercept image responses to capture bytes for later Supabase upload
    // (CDNs like reastatic.net block server-side re-downloads)
    const downloadPromises: Promise<void>[] = [];
    page.on("response", (response) => {
      const respUrl = response.url();
      const ct = response.headers()["content-type"] || "";
      if (
        response.status() === 200 &&
        (ct.startsWith("image/") ||
          /\.(jpe?g|png|webp|avif)(\?|$)/i.test(respUrl)) &&
        !respUrl.includes("logo") &&
        !respUrl.includes("avatar") &&
        !respUrl.includes("icon") &&
        !respUrl.includes("sprite") &&
        !respUrl.includes("pixel") &&
        !respUrl.includes("badge")
      ) {
        downloadPromises.push(
          response
            .body()
            .then((body) => {
              if (body.length > 10_000) {
                imageBufferCache.set(respUrl, Buffer.from(body));
              }
            })
            .catch(() => {})
        );
      }
    });

    // Use networkidle to wait for bot protection challenges to resolve
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    // Extra wait for JS-rendered content
    await page.waitForTimeout(3000);

    // Check if we got past bot protection
    const blocked = await page.evaluate(
      `!!document.querySelector("script[src*='ips.js']") && !document.querySelector("h1")`
    );
    if (blocked) {
      console.log("[DreamHome] Kasada bot protection detected, waiting longer...");
      await page.waitForTimeout(5000);
    }

    // Get the title
    const title = await page.evaluate(`
      (document.querySelector('meta[property="og:title"]') || {}).content ||
      (document.querySelector("title") || {}).textContent ||
      (document.querySelector("h1") || {}).textContent ||
      null
    `) as string | null;

    // Try to open the image gallery by clicking common gallery triggers
    const galleryOpened = await page.evaluate(`(function() {
      var previewBtn = document.querySelector(
        'button[class*="media-type-bar"], button[aria-label*="image"], button[aria-label*="photo"]'
      );
      if (previewBtn) { previewBtn.click(); return "media-bar"; }

      var galleryBtn = document.querySelector(
        '[class*="gallery"] button, [class*="photo-count"], [class*="image-count"], button[class*="preview"]'
      );
      if (galleryBtn) { galleryBtn.click(); return "gallery-btn"; }

      var heroImg = document.querySelector(
        '[class*="hero"] img, [class*="main-image"] img, [class*="property-image"] img'
      );
      if (heroImg) { heroImg.click(); return "hero-img"; }

      return null;
    })()`) as string | null;

    if (galleryOpened) {
      await page.waitForTimeout(1500);
    }

    // Passed as a string to avoid tsx adding __name helpers that don't exist in browser context
    const imageHashes = await page.evaluate(`(async () => {
      var collected = new Set();

      function collectFromDom() {
        document.querySelectorAll("img").forEach(function(img) {
          var alt = (img.alt || "").toLowerCase();
          var isFloorplan =
            alt.includes("floorplan") ||
            alt.includes("floor plan") ||
            alt.includes("floor-plan") ||
            alt.includes("site plan");
          if (
            img.src &&
            !isFloorplan &&
            !img.src.includes("logo") &&
            !img.src.includes("avatar") &&
            !img.src.includes("icon") &&
            !img.src.includes("sprite") &&
            !img.src.includes("pixel") &&
            !img.src.includes("badge")
          ) {
            var hashMatch = img.src.match(/([a-f0-9]{64})/);
            if (hashMatch) {
              collected.add(hashMatch[1]);
            } else if (img.naturalWidth > 200 || img.width > 200) {
              collected.add(img.src);
            }
          }
        });
      }

      collectFromDom();

      var observer = new MutationObserver(function() { collectFromDom(); });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src"],
      });

      var hasLightbox = document.querySelector(
        '.pswp, [class*="lightbox"], [class*="gallery-viewer"], [role="dialog"]'
      );

      if (hasLightbox) {
        var totalMatch = (document
          .querySelector('[class*="counter"], [class*="count"]') || {})
          .textContent;
        var nums = totalMatch ? totalMatch.match(/(\\d+)/g) : null;
        var estimatedTotal = nums
          ? Math.max.apply(null, nums.map(Number))
          : 50;
        var arrowPresses = Math.min(estimatedTotal + 5, 55);

        for (var i = 0; i < arrowPresses; i++) {
          var nextBtn = document.querySelector(
            '.pswp__button--arrow--right, [class*="arrow-right"], [aria-label="Next"], [class*="next"]'
          );
          if (nextBtn) nextBtn.click();

          document.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "ArrowRight",
              code: "ArrowRight",
              bubbles: true,
            })
          );

          await new Promise(function(r) { setTimeout(r, 200); });
          collectFromDom();
        }
      }

      observer.disconnect();
      return Array.from(collected);
    })()`) as string[];

    // Wait for all intercepted image downloads to finish
    await Promise.all(downloadPromises);
    console.log(
      `[DreamHome] Captured ${imageBufferCache.size} image buffers from browser`
    );

    await browser.close();
    browser = null;

    if (imageHashes.length === 0) return null;

    // Build full URLs from hashes or use as-is
    const domain = getDomain(url);
    const imageUrls = imageHashes
      .map((hash) => {
        if (hash.startsWith("http")) return hash;
        // Build high-res URL for reastatic hashes
        if (domain.includes("realestate.com.au")) {
          return `https://i2.au.reastatic.net/1200x900/${hash}/image.jpg`;
        }
        // For domain.com.au hashes, try building a URL
        return `https://i2.au.reastatic.net/1200x900/${hash}/image.jpg`;
      })
      .filter(
        (u) =>
          !u.includes("logo") &&
          !u.includes("avatar") &&
          !u.includes("icon")
      );

    const unique = deduplicateUrls(imageUrls).slice(0, 50);
    if (unique.length === 0) return null;

    return {
      title,
      imageUrls: unique,
      domain,
    };
  } catch (error) {
    console.error("[DreamHome] Playwright scrape failed:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// =============================================================================
// Firecrawl-based scraper (fallback 1)
// =============================================================================

async function scrapeListingWithFirecrawl(
  url: string
): Promise<DreamHomeListingScrapeResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  try {
    const firecrawl = new FirecrawlApp({ apiKey });

    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          prompt:
            'Extract the property listing title as "title" and ALL property/gallery image URLs (full absolute URLs) as an array called "images". Include every property photo, interior shot, exterior shot, and floor plan image. Exclude logos, icons, agent photos, and UI elements.',
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              images: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["images"],
          },
        },
      ],
    });

    if (!result) return null;

    const json = result.json as {
      title?: string;
      images?: string[];
    } | null;

    const metadata = result.metadata;
    const title = json?.title || metadata?.ogTitle || metadata?.title || null;
    const images = (json?.images || []).filter(
      (u: string) =>
        u &&
        u.startsWith("http") &&
        !u.includes("example.com") &&
        !u.includes("placeholder")
    );

    if (metadata?.ogImage && !images.includes(metadata.ogImage)) {
      images.unshift(metadata.ogImage);
    }

    if (images.length === 0) return null;

    return {
      title,
      imageUrls: deduplicateUrls(images).slice(0, 50),
      domain: getDomain(url),
    };
  } catch (error) {
    console.error("[DreamHome] Firecrawl scrape failed:", error);
    return null;
  }
}

// =============================================================================
// Cheerio-based scraper (fallback 2 — static HTML only)
// =============================================================================

async function scrapeListingWithCheerio(
  url: string
): Promise<DreamHomeListingScrapeResult | null> {
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
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      null;

    const images: string[] = [];

    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) {
      const abs = toAbsoluteUrl(ogImage, url);
      if (abs) images.push(abs);
    }

    $("img").each((_, el) => {
      const src =
        $(el).attr("data-src") || $(el).attr("src") || $(el).attr("data-lazy");
      if (!src) return;

      const width = parseInt($(el).attr("width") || "0", 10);
      const height = parseInt($(el).attr("height") || "0", 10);
      if ((width > 0 && width < 200) || (height > 0 && height < 150)) return;
      if (/logo|icon|avatar|badge|sprite|pixel/i.test(src)) return;

      const abs = toAbsoluteUrl(src, url);
      if (abs) images.push(abs);
    });

    $("img[srcset], source[srcset]").each((_, el) => {
      const srcset = $(el).attr("srcset") || "";
      const parts = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]);
      for (const part of parts) {
        const abs = toAbsoluteUrl(part, url);
        if (abs) images.push(abs);
      }
    });

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        const imageField = data.image || data.photo;
        if (Array.isArray(imageField)) {
          for (const img of imageField) {
            const imgUrl = typeof img === "string" ? img : img?.url;
            if (imgUrl) {
              const abs = toAbsoluteUrl(imgUrl, url);
              if (abs) images.push(abs);
            }
          }
        } else if (typeof imageField === "string") {
          const abs = toAbsoluteUrl(imageField, url);
          if (abs) images.push(abs);
        }
      } catch {
        // ignore parse errors
      }
    });

    const unique = deduplicateUrls(images).slice(0, 50);
    if (unique.length === 0) return null;

    return {
      title,
      imageUrls: unique,
      domain: getDomain(url),
    };
  } catch (error) {
    console.error("[DreamHome] Cheerio scrape failed:", error);
    return null;
  }
}

// =============================================================================
// Main entry point — Playwright first, then Firecrawl, then Cheerio
// =============================================================================

export async function scrapeListingImages(
  url: string
): Promise<DreamHomeListingScrapeResult> {
  // Try Playwright first (handles JS-rendered galleries like realestate.com.au)
  console.log("[DreamHome] Attempting Playwright scrape...");
  const playwrightResult = await scrapeListingWithPlaywright(url);
  if (playwrightResult && playwrightResult.imageUrls.length > 3) {
    console.log(
      `[DreamHome] Playwright found ${playwrightResult.imageUrls.length} images`
    );
    return playwrightResult;
  }

  // Fallback to Firecrawl
  console.log("[DreamHome] Falling back to Firecrawl...");
  const firecrawlResult = await scrapeListingWithFirecrawl(url);
  if (firecrawlResult && firecrawlResult.imageUrls.length > 0) {
    console.log(
      `[DreamHome] Firecrawl found ${firecrawlResult.imageUrls.length} images`
    );
    return firecrawlResult;
  }

  // Fallback to Cheerio
  console.log("[DreamHome] Falling back to Cheerio...");
  const cheerioResult = await scrapeListingWithCheerio(url);
  if (cheerioResult && cheerioResult.imageUrls.length > 0) {
    console.log(
      `[DreamHome] Cheerio found ${cheerioResult.imageUrls.length} images`
    );
    return cheerioResult;
  }

  return {
    title: null,
    imageUrls: [],
    domain: getDomain(url),
  };
}
