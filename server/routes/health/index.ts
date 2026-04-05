import { Router, Request, Response } from "express";
import type { HealthSummary } from "../../../shared/types/health.ts";
import whoopRoutes from "./whoop.ts";
import eightSleepRoutes from "./eightSleep.ts";
import renphoRoutes from "./renpho.ts";
import appleHealthRoutes from "./appleHealth.ts";
import { runHealthSync } from "../../services/healthDataCron.ts";

const router = Router();

// Mount individual service routes
router.use("/whoop", whoopRoutes);
router.use("/eightsleep", eightSleepRoutes);
router.use("/renpho", renphoRoutes);
router.use("/apple", appleHealthRoutes);

// Unified health summary endpoint
// Returns data from all configured services in a single response
router.get("/summary", async (_req: Request, res: Response) => {
  const summary: HealthSummary = {
    whoop: null,
    whoopSleep: null,
    eightSleep: null,
    renpho: null,
    appleHealth: null,
    lastUpdated: new Date().toISOString(),
  };

  // Fetch from all services in parallel, catching errors individually
  const [whoopResult, eightSleepResult, renphoResult, appleHealthResult] = await Promise.allSettled([
    fetchWhoopData(),
    fetchEightSleepData(),
    fetchRenphoData(),
    fetchAppleHealthData(),
  ]);

  if (whoopResult.status === "fulfilled" && whoopResult.value) {
    summary.whoop = whoopResult.value.recovery;
    summary.whoopSleep = whoopResult.value.sleep;
  }

  if (eightSleepResult.status === "fulfilled" && eightSleepResult.value) {
    summary.eightSleep = eightSleepResult.value;
  }

  if (renphoResult.status === "fulfilled" && renphoResult.value) {
    summary.renpho = renphoResult.value;
  }

  if (appleHealthResult.status === "fulfilled" && appleHealthResult.value) {
    summary.appleHealth = appleHealthResult.value;
  }

  res.json(summary);
});

// Internal fetch functions that call the same logic as the routes
async function fetchWhoopData(): Promise<{ recovery: any; sleep: any } | null> {
  if (!process.env.WHOOP_REFRESH_TOKEN) return null;

  try {
    const baseUrl = `http://localhost:${process.env.PORT || 3005}`;
    const [recoveryRes, sleepRes] = await Promise.all([
      fetch(`${baseUrl}/api/health/whoop/recovery`),
      fetch(`${baseUrl}/api/health/whoop/sleep`),
    ]);

    const recovery = recoveryRes.ok ? await recoveryRes.json() : null;
    const sleep = sleepRes.ok ? await sleepRes.json() : null;

    if (!recovery && !sleep) return null;
    return { recovery, sleep };
  } catch {
    return null;
  }
}

async function fetchEightSleepData(): Promise<any | null> {
  if (!process.env.EIGHT_SLEEP_EMAIL) return null;

  try {
    const baseUrl = `http://localhost:${process.env.PORT || 3005}`;
    const res = await fetch(`${baseUrl}/api/health/eightsleep/sleep`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function fetchRenphoData(): Promise<any | null> {
  if (!process.env.RENPHO_EMAIL) return null;

  try {
    const baseUrl = `http://localhost:${process.env.PORT || 3005}`;
    const res = await fetch(`${baseUrl}/api/health/renpho/latest`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function fetchAppleHealthData(): Promise<any | null> {
  try {
    const baseUrl = `http://localhost:${process.env.PORT || 3005}`;
    const res = await fetch(`${baseUrl}/api/health/apple/latest`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Connection status for all services
router.get("/status", async (_req: Request, res: Response) => {
  const services = {
    whoop: {
      configured: !!(process.env.WHOOP_CLIENT_ID && process.env.WHOOP_CLIENT_SECRET),
      connected: !!process.env.WHOOP_REFRESH_TOKEN,
      authUrl: process.env.WHOOP_REFRESH_TOKEN ? null : "/api/health/whoop/auth",
    },
    eightSleep: {
      configured: !!(process.env.EIGHT_SLEEP_EMAIL && process.env.EIGHT_SLEEP_PASSWORD),
      connected: false, // Will check below
    },
    renpho: {
      configured: !!(process.env.RENPHO_EMAIL && process.env.RENPHO_PASSWORD),
      connected: false, // Will check below
    },
    appleHealth: {
      configured: true, // Always available (webhook-based)
      connected: false, // Check if we have data
      webhookUrl: "/api/health/apple/ingest",
    },
  };

  // Check actual connections
  try {
    const baseUrl = `http://localhost:${process.env.PORT || 3005}`;

    if (services.eightSleep.configured) {
      const esRes = await fetch(`${baseUrl}/api/health/eightsleep/connection`);
      if (esRes.ok) {
        const data = await esRes.json();
        services.eightSleep.connected = data.connected;
      }
    }

    if (services.renpho.configured) {
      const rpRes = await fetch(`${baseUrl}/api/health/renpho/connection`);
      if (rpRes.ok) {
        const data = await rpRes.json();
        services.renpho.connected = data.connected;
      }
    }

    const ahRes = await fetch(`${baseUrl}/api/health/apple/status`);
    if (ahRes.ok) {
      const data = await ahRes.json();
      services.appleHealth.connected = data.hasData;
    }
  } catch (error) {
    // Ignore connection check errors
  }

  res.json(services);
});

// Manual sync trigger endpoint
router.post("/sync", async (_req: Request, res: Response) => {
  console.log("[HealthRouter] Manual sync triggered");
  try {
    await runHealthSync();
    res.json({ success: true, message: "Health data sync completed" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[HealthRouter] Sync failed:", msg);
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
