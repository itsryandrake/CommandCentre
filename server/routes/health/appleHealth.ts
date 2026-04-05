import { Router, Request, Response } from "express";
import crypto from "crypto";
import type { AppleHealthData, AppleHealthWorkout } from "../../../shared/types/health.ts";
import { isSupabaseConfigured } from "../../db/supabase.ts";

// Dynamic import based on database configuration
async function getDb() {
  if (isSupabaseConfigured()) {
    return await import("../../db/appleHealthSupabase.ts");
  }
  return await import("../../db/appleHealth.ts");
}

const router = Router();

// Verify webhook signature (optional but recommended)
function verifySignature(payload: string, signature: string | undefined): boolean {
  const secret = process.env.APPLE_HEALTH_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if no secret configured

  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Helper to get AEST date
function getAESTDate(): string {
  const now = new Date();
  const aest = new Date(now.getTime() + (10 * 60 * 60 * 1000)); // UTC+10
  return aest.toISOString().split("T")[0];
}

// Webhook endpoint to receive data from Health Auto Export iOS app
// Supports multiple payload formats from different iOS health apps
router.post("/ingest", async (req: Request, res: Response) => {
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers["x-signature"] as string | undefined;

  // Verify signature if secret is configured
  if (process.env.APPLE_HEALTH_WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  try {
    const payload = req.body;
    const db = await getDb();

    // Handle Health Auto Export format
    if (payload.data && payload.data.metrics) {
      await processHealthAutoExportPayload(payload, db);
      return res.json({ success: true, format: "health-auto-export" });
    }

    // Handle direct metrics format
    if (payload.steps !== undefined || payload.activeCalories !== undefined) {
      await processDirectMetrics(payload, db);
      return res.json({ success: true, format: "direct" });
    }

    // Handle array of metrics
    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (item.steps !== undefined || item.activeCalories !== undefined) {
          await processDirectMetrics(item, db);
        }
      }
      return res.json({ success: true, format: "array", count: payload.length });
    }

    return res.status(400).json({ error: "Unknown payload format" });
  } catch (error) {
    console.error("[AppleHealth] Ingest error:", error);
    res.status(500).json({ error: "Failed to process health data" });
  }
});

// Process Health Auto Export app format
interface HealthAutoExportPayload {
  data: {
    metrics: Array<{
      name: string;
      units: string;
      data: Array<{
        date: string;
        qty?: number;
        Avg?: number;
        Min?: number;
        Max?: number;
        asleep?: number;
      }>;
    }>;
    workouts?: Array<{
      name: string;
      start: string;
      end: string;
      duration?: number;
      activeEnergy?: { qty: number };
      distance?: { qty: number };
      heartRateAverage?: { qty: number };
    }>;
  };
}

type DbModule = {
  upsertDailyMetrics: (data: AppleHealthData) => void | Promise<void>;
  insertWorkout: (workout: AppleHealthWorkout) => void | Promise<void>;
  getLatestMetrics: () => AppleHealthData | null | Promise<AppleHealthData | null>;
  getMetricsForDate: (date: string) => AppleHealthData | null | Promise<AppleHealthData | null>;
  getMetricsHistory: (days: number) => AppleHealthData[] | Promise<AppleHealthData[]>;
  getWorkouts: (startDate: string, endDate: string) => AppleHealthWorkout[] | Promise<AppleHealthWorkout[]>;
  getRecentWorkouts: (limit: number) => AppleHealthWorkout[] | Promise<AppleHealthWorkout[]>;
};

async function processHealthAutoExportPayload(payload: HealthAutoExportPayload, db: DbModule): Promise<void> {
  const metrics = payload.data.metrics;
  const dailyData: Record<string, Partial<AppleHealthData>> = {};

  for (const metric of metrics) {
    for (const dataPoint of metric.data) {
      const date = dataPoint.date.split(" ")[0]; // Extract date part
      if (!dailyData[date]) {
        dailyData[date] = { date };
      }

      const value = dataPoint.qty ?? dataPoint.Avg ?? 0;

      switch (metric.name.toLowerCase()) {
        case "step_count":
        case "steps":
          dailyData[date].steps = Math.round(value);
          break;
        case "active_energy":
        case "active_energy_burned":
          dailyData[date].activeCalories = Math.round(value);
          break;
        case "basal_energy":
        case "basal_energy_burned":
        case "resting_energy":
          dailyData[date].restingCalories = Math.round(value);
          break;
        case "resting_heart_rate":
          dailyData[date].restingHeartRate = Math.round(value);
          break;
        case "walking_heart_rate_average":
          dailyData[date].walkingHeartRateAvg = Math.round(value);
          break;
        case "sleep_analysis":
        case "sleep":
          dailyData[date].sleepHours = Math.round((dataPoint.asleep ?? value) / 60 * 10) / 10;
          break;
        case "apple_stand_hour":
        case "stand_hours":
          dailyData[date].standHours = Math.round(value);
          break;
        case "apple_exercise_time":
        case "exercise_time":
          dailyData[date].exerciseMinutes = Math.round(value);
          break;
        case "distance_walking_running":
        case "walking_running_distance":
          dailyData[date].distanceKm = Math.round(value * 100) / 100;
          break;
        case "flights_climbed":
          dailyData[date].flightsClimbed = Math.round(value);
          break;
      }
    }
  }

  // Save each day's metrics
  for (const [date, data] of Object.entries(dailyData)) {
    const fullData: AppleHealthData = {
      date,
      steps: data.steps ?? 0,
      activeCalories: data.activeCalories ?? 0,
      restingCalories: data.restingCalories ?? 0,
      totalCalories: (data.activeCalories ?? 0) + (data.restingCalories ?? 0),
      restingHeartRate: data.restingHeartRate ?? 0,
      walkingHeartRateAvg: data.walkingHeartRateAvg,
      sleepHours: data.sleepHours ?? 0,
      standHours: data.standHours ?? 0,
      exerciseMinutes: data.exerciseMinutes ?? 0,
      distanceKm: data.distanceKm ?? 0,
      flightsClimbed: data.flightsClimbed ?? 0,
    };

    await db.upsertDailyMetrics(fullData);
  }

  // Process workouts if present
  if (payload.data.workouts) {
    for (const workout of payload.data.workouts) {
      const workoutData: AppleHealthWorkout = {
        type: workout.name,
        startTime: workout.start,
        endTime: workout.end,
        duration: workout.duration ?? 0,
        calories: workout.activeEnergy?.qty ?? 0,
        distance: workout.distance?.qty,
        avgHeartRate: workout.heartRateAverage?.qty,
      };

      await db.insertWorkout(workoutData);
    }
  }
}

// Process direct metrics format
interface DirectMetricsPayload {
  date?: string;
  steps?: number;
  activeCalories?: number;
  restingCalories?: number;
  totalCalories?: number;
  restingHeartRate?: number;
  walkingHeartRateAvg?: number;
  sleepHours?: number;
  standHours?: number;
  exerciseMinutes?: number;
  distanceKm?: number;
  flightsClimbed?: number;
}

async function processDirectMetrics(payload: DirectMetricsPayload, db: DbModule): Promise<void> {
  const data: AppleHealthData = {
    date: payload.date ?? getAESTDate(),
    steps: payload.steps ?? 0,
    activeCalories: payload.activeCalories ?? 0,
    restingCalories: payload.restingCalories ?? 0,
    totalCalories: payload.totalCalories ?? ((payload.activeCalories ?? 0) + (payload.restingCalories ?? 0)),
    restingHeartRate: payload.restingHeartRate ?? 0,
    walkingHeartRateAvg: payload.walkingHeartRateAvg,
    sleepHours: payload.sleepHours ?? 0,
    standHours: payload.standHours ?? 0,
    exerciseMinutes: payload.exerciseMinutes ?? 0,
    distanceKm: payload.distanceKm ?? 0,
    flightsClimbed: payload.flightsClimbed ?? 0,
  };

  await db.upsertDailyMetrics(data);
}

// Get latest metrics
router.get("/latest", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const data = await db.getLatestMetrics();

    if (!data) {
      return res.status(404).json({
        error: "No health data available",
        setup: {
          message: "Configure Health Auto Export iOS app to send data to this endpoint",
          endpoint: "/api/health/apple/ingest",
          method: "POST",
        },
      });
    }

    res.json(data);
  } catch (error) {
    console.error("[AppleHealth] Latest fetch error:", error);
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});

// Get today's metrics
router.get("/today", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const today = getAESTDate();
    const data = await db.getMetricsForDate(today);

    if (!data) {
      // Return empty metrics for today instead of 404
      return res.json({
        date: today,
        steps: 0,
        activeCalories: 0,
        restingCalories: 0,
        totalCalories: 0,
        restingHeartRate: 0,
        sleepHours: 0,
        standHours: 0,
        exerciseMinutes: 0,
        distanceKm: 0,
        flightsClimbed: 0,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("[AppleHealth] Today fetch error:", error);
    res.status(500).json({ error: "Failed to fetch today's data" });
  }
});

// Get historical metrics
router.get("/history", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const days = parseInt(req.query.days as string) || 7;
    const history = await db.getMetricsHistory(days);

    // Calculate summary stats
    const totalSteps = history.reduce((sum, d) => sum + d.steps, 0);
    const avgSteps = history.length ? Math.round(totalSteps / history.length) : 0;
    const totalExercise = history.reduce((sum, d) => sum + d.exerciseMinutes, 0);
    const avgSleep = history.length
      ? Math.round((history.reduce((sum, d) => sum + d.sleepHours, 0) / history.length) * 10) / 10
      : 0;

    res.json({
      history: history.reverse(), // Oldest first for charting
      summary: {
        totalSteps,
        avgSteps,
        totalExercise,
        avgSleep,
        daysTracked: history.length,
      },
    });
  } catch (error) {
    console.error("[AppleHealth] History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get workouts
router.get("/workouts", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const days = parseInt(req.query.days as string) || 7;
    const endDate = getAESTDate();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await db.getWorkouts(startDate.toISOString().split("T")[0], endDate);

    res.json({ workouts });
  } catch (error) {
    console.error("[AppleHealth] Workouts fetch error:", error);
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
});

// Get recent workouts
router.get("/workouts/recent", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const limit = parseInt(req.query.limit as string) || 10;
    const workouts = await db.getRecentWorkouts(limit);

    res.json({ workouts });
  } catch (error) {
    console.error("[AppleHealth] Recent workouts fetch error:", error);
    res.status(500).json({ error: "Failed to fetch recent workouts" });
  }
});

// Connection status (check if we have any data)
router.get("/status", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const latest = await db.getLatestMetrics();

    res.json({
      hasData: !!latest,
      lastUpdate: latest?.date ?? null,
      webhookUrl: "/api/health/apple/ingest",
      database: isSupabaseConfigured() ? "supabase" : "sqlite",
    });
  } catch (error) {
    res.json({
      hasData: false,
      lastUpdate: null,
      webhookUrl: "/api/health/apple/ingest",
      database: isSupabaseConfigured() ? "supabase" : "sqlite",
    });
  }
});

export default router;
