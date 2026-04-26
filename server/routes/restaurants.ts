import { Router, Request, Response } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";
import {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../db/restaurants.ts";
import type { GoogleReview } from "../../shared/types/restaurant.ts";

const router = Router();

/** Scrape Google reviews for a restaurant using Firecrawl */
async function scrapeGoogleReviews(
  name: string,
  city: string,
  address?: string
): Promise<{ reviews: GoogleReview[]; imageUrl: string | null }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("[Restaurants] No FIRECRAWL_API_KEY configured");
    return { reviews: [], imageUrl: null };
  }

  try {
    const firecrawl = new FirecrawlApp({ apiKey });
    const searchQuery = `${name} ${address || city} restaurant reviews`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          prompt:
            'Extract Google reviews for this restaurant from the knowledge panel. For each review extract the reviewer name as "author", their star rating (1-5) as "rating", the review text as "text", and when it was posted (e.g. "2 months ago") as "relativeTime". Also extract the overall Google rating as "overallRating", the total review count as "reviewCount", and the main restaurant photo URL as "imageUrl".',
          schema: {
            type: "object",
            properties: {
              overallRating: { type: "number" },
              reviewCount: { type: "number" },
              imageUrl: { type: "string" },
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    author: { type: "string" },
                    rating: { type: "number" },
                    text: { type: "string" },
                    relativeTime: { type: "string" },
                  },
                  required: ["author", "rating", "text"],
                },
              },
            },
          },
        },
      ],
    });

    if (!result?.json) return { reviews: [], imageUrl: null };

    const json = result.json as {
      overallRating?: number;
      reviewCount?: number;
      imageUrl?: string;
      reviews?: GoogleReview[];
    };

    const reviews = (json.reviews || [])
      .filter((r) => r.author && r.text && r.text.length > 5)
      .slice(0, 5);

    // Try to get a better image from og:image metadata
    const imageUrl =
      json.imageUrl && json.imageUrl.startsWith("http")
        ? json.imageUrl
        : result.metadata?.ogImage || null;

    return { reviews, imageUrl };
  } catch (error) {
    console.error("[Restaurants] Firecrawl review scrape failed:", error);
    return { reviews: [], imageUrl: null };
  }
}

/** Geocode an address using Nominatim (OpenStreetMap) */
async function geocodeAddress(
  address: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = `${address}, ${city}, Australia`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "DrakeFamilyCommandCentre/1.0" },
    });
    if (!response.ok) return null;
    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

// POST /api/restaurants/geocode/batch - Geocode all restaurants missing coordinates
router.post("/geocode/batch", async (_req: Request, res: Response) => {
  try {
    const all = await listRestaurants();
    const needGeocode = all.filter((r) => r.address && !r.latitude);

    res.json({
      total: needGeocode.length,
      message: `Geocoding ${needGeocode.length} restaurants in the background`,
    });

    (async () => {
      for (const restaurant of needGeocode) {
        try {
          const coords = await geocodeAddress(restaurant.address!, restaurant.city);
          if (coords) {
            await updateRestaurant(restaurant.id, {
              latitude: coords.lat,
              longitude: coords.lng,
            });
            console.log(`[Restaurants] Geocoded ${restaurant.name}: ${coords.lat}, ${coords.lng}`);
          }
          // Nominatim rate limit: 1 request per second
          await new Promise((r) => setTimeout(r, 1100));
        } catch (err) {
          console.error(`[Restaurants] Failed to geocode ${restaurant.name}:`, err);
        }
      }
      console.log("[Restaurants] Batch geocoding complete");
    })();
  } catch (error) {
    console.error("[Restaurants] Error starting batch geocode:", error);
    res.status(500).json({ error: "Failed to start batch geocode" });
  }
});

// GET /api/restaurants - List with optional filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { city, cuisine, status, priceRange, mealType } = req.query;
    const items = await listRestaurants({
      city: city as string | undefined,
      cuisineType: cuisine as string | undefined,
      status: status as string | undefined,
      priceRange: priceRange ? Number(priceRange) : undefined,
      mealType: mealType as string | undefined,
    });
    res.json(items);
  } catch (error) {
    console.error("[Restaurants] Error listing:", error);
    res.status(500).json({ error: "Failed to list restaurants" });
  }
});

// POST /api/restaurants/scrape - Scrape restaurant info from URL or name
router.post("/scrape", async (req: Request, res: Response) => {
  try {
    const { url, name, city } = req.body;
    if (!url && !name) {
      return res.status(400).json({ error: "url or name is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Determine what URL to fetch
    let targetUrl = url;
    if (!targetUrl && name) {
      // Search Google Maps for the restaurant
      const searchQuery = city ? `${name} ${city} restaurant` : `${name} restaurant`;
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    }

    // Try Firecrawl first if available
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (firecrawlKey) {
      try {
        const FirecrawlApp = (await import("@mendable/firecrawl-js")).default;
        const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });

        const result = await firecrawl.scrape(targetUrl, {
          formats: [
            {
              type: "json",
              prompt:
                'Extract restaurant information: "name" (restaurant name), "address" (full street address), "phone" (phone number), "cuisineType" (type of cuisine e.g. Italian, Japanese, Thai), "priceRange" (1-4 where 1=cheap, 2=moderate, 3=expensive, 4=very expensive), "imageUrl" (primary image URL), "websiteUrl" (restaurant website if available), "googleMapsUrl" (Google Maps link if available).',
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  address: { type: "string" },
                  phone: { type: "string" },
                  cuisineType: { type: "string" },
                  priceRange: { type: "number" },
                  imageUrl: { type: "string" },
                  websiteUrl: { type: "string" },
                  googleMapsUrl: { type: "string" },
                },
                required: ["name"],
              },
            },
          ],
        });

        if (result?.json) {
          const json = result.json as any;
          if (json.name) {
            return res.json({
              name: json.name,
              address: json.address || undefined,
              phone: json.phone || undefined,
              cuisineType: json.cuisineType || undefined,
              priceRange: json.priceRange ? Number(json.priceRange) : undefined,
              imageUrl: json.imageUrl || result.metadata?.ogImage || undefined,
              websiteUrl: json.websiteUrl || undefined,
              googleMapsUrl: json.googleMapsUrl || (url?.includes("google.com/maps") ? url : undefined),
            });
          }
        }
      } catch (err) {
        console.error("[Restaurants] Firecrawl scrape failed, falling back:", err);
      }
    }

    // Fallback: Fetch page and use OpenAI to extract info
    const pageResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!pageResponse.ok) {
      return res.status(400).json({ error: "Could not fetch URL" });
    }

    const html = await pageResponse.text();
    const truncated = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'Extract restaurant information from the following page content. Return valid JSON with these fields (omit any you can\'t find): name, address, phone, cuisineType (e.g. Italian, Japanese), priceRange (1-4 where 1=cheap, 4=very expensive), imageUrl, websiteUrl. Return only the JSON object, no markdown.',
          },
          { role: "user", content: truncated },
        ],
        max_tokens: 500,
        temperature: 0,
      }),
    });

    if (!aiResponse.ok) {
      return res.status(500).json({ error: "Failed to parse restaurant info" });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "{}";
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    res.json({
      ...parsed,
      googleMapsUrl: url?.includes("google.com/maps") || url?.includes("goo.gl/maps") ? url : undefined,
    });
  } catch (error) {
    console.error("[Restaurants] Error scraping:", error);
    res.status(500).json({ error: "Failed to scrape restaurant info" });
  }
});

// POST /api/restaurants/reviews/batch - Fetch reviews for all restaurants missing them
router.post("/reviews/batch", async (_req: Request, res: Response) => {
  try {
    const all = await listRestaurants();
    const needReviews = all.filter(
      (r) => !r.googleReviews || r.googleReviews.length === 0
    );

    res.json({
      total: needReviews.length,
      message: `Fetching reviews for ${needReviews.length} restaurants in the background`,
    });

    // Process in background sequentially (one browser at a time)
    (async () => {
      for (const restaurant of needReviews) {
        try {
          const { reviews, imageUrl } = await scrapeGoogleReviews(
            restaurant.name,
            restaurant.city,
            restaurant.address
          );

          const updates: any = { googleReviews: reviews };
          if (imageUrl && !restaurant.imageUrl) {
            updates.imageUrl = imageUrl;
          }
          await updateRestaurant(restaurant.id, updates);
          console.log(
            `[Restaurants] Fetched ${reviews.length} reviews for ${restaurant.name}`
          );

          // Small delay between restaurants
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          console.error(
            `[Restaurants] Failed to fetch reviews for ${restaurant.name}:`,
            err
          );
        }
      }
      console.log("[Restaurants] Batch review fetch complete");
    })();
  } catch (error) {
    console.error("[Restaurants] Error starting batch reviews:", error);
    res.status(500).json({ error: "Failed to start batch review fetch" });
  }
});

// POST /api/restaurants/:id/reviews - Scrape Google reviews for a restaurant
router.post("/:id/reviews", async (req: Request, res: Response) => {
  try {
    const restaurant = await getRestaurant(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const { reviews, imageUrl } = await scrapeGoogleReviews(
      restaurant.name,
      restaurant.city,
      restaurant.address
    );

    const updates: any = { googleReviews: reviews };
    if (imageUrl && !restaurant.imageUrl) {
      updates.imageUrl = imageUrl;
    }

    const updated = await updateRestaurant(req.params.id, updates);
    res.json({ reviews, restaurant: updated });
  } catch (error) {
    console.error("[Restaurants] Error scraping reviews:", error);
    res.status(500).json({ error: "Failed to scrape reviews" });
  }
});

// GET /api/restaurants/:id - Get single restaurant
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await getRestaurant(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("[Restaurants] Error getting:", error);
    res.status(500).json({ error: "Failed to get restaurant" });
  }
});

// POST /api/restaurants - Create
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, city } = req.body;
    if (!name || !city) {
      return res.status(400).json({ error: "name and city are required" });
    }

    // Auto-geocode if address provided and no coordinates
    if (req.body.address && !req.body.latitude) {
      const coords = await geocodeAddress(req.body.address, city);
      if (coords) {
        req.body.latitude = coords.lat;
        req.body.longitude = coords.lng;
      }
    }

    const item = await createRestaurant(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error("[Restaurants] Error creating:", error);
    res.status(500).json({ error: "Failed to create restaurant" });
  }
});

// PATCH /api/restaurants/:id - Update
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const item = await updateRestaurant(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("[Restaurants] Error updating:", error);
    res.status(500).json({ error: "Failed to update restaurant" });
  }
});

// DELETE /api/restaurants/:id - Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteRestaurant(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Restaurants] Error deleting:", error);
    res.status(500).json({ error: "Failed to delete restaurant" });
  }
});

export default router;
