import { Router, Request, Response } from "express";
import type { TideData, TideExtreme } from "../../shared/types/tides.ts";

const router = Router();

// Cache for tide data (6 hour TTL to stay within free tier limits)
let tideCache: { data: TideData; timestamp: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000;

// Brisbane / Moreton Bay coordinates
const BRISBANE_LAT = -27.3667;
const BRISBANE_LON = 153.1667;

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Brisbane",
  });
}

router.get("/", async (_req: Request, res: Response) => {
  const apiKey = process.env.WORLDTIDES_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Tide service not configured",
      message: "WORLDTIDES_API_KEY not set",
    });
  }

  // Check cache
  if (tideCache && Date.now() - tideCache.timestamp < CACHE_TTL) {
    return res.json(tideCache.data);
  }

  try {
    const response = await fetch(
      `https://www.worldtides.info/api/v3?extremes&lat=${BRISBANE_LAT}&lon=${BRISBANE_LON}&length=86400&key=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch tide data");
    }

    const data = await response.json();

    const extremes: TideExtreme[] = (data.extremes || []).map((e: { type: string; dt: number; height: number }) => ({
      type: e.type === "High" ? "High" : "Low",
      height: Math.round(e.height * 100) / 100,
      timestamp: new Date(e.dt * 1000).toISOString(),
      time: formatTime(new Date(e.dt * 1000).toISOString()),
    }));

    const tideData: TideData = {
      station: data.station || "Moreton Bay",
      extremes,
      lastUpdated: new Date().toISOString(),
    };

    tideCache = { data: tideData, timestamp: Date.now() };
    res.json(tideData);
  } catch (error) {
    console.error("[Tides] Error fetching tides:", error);
    res.status(500).json({
      error: "Failed to fetch tide data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
