import { Router, Request, Response } from "express";
import type { WhoopRecovery, WhoopSleepData } from "../../../shared/types/health.ts";

const router = Router();

// Whoop API base URL
const WHOOP_API_BASE = "https://api.prod.whoop.com/developer";
const WHOOP_AUTH_BASE = "https://api.prod.whoop.com/oauth/oauth2";

// Cache for token and data
let accessToken: string | null = null;
let tokenExpiry: number = 0;
let recoveryCache: { data: WhoopRecovery; timestamp: number } | null = null;
let sleepCache: { data: WhoopSleepData; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to get date in AEST
function getAESTDate(): string {
  const now = new Date();
  const aest = new Date(now.getTime() + (10 * 60 * 60 * 1000)); // UTC+10
  return aest.toISOString().split("T")[0];
}

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<string | null> {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const refreshToken = process.env.WHOOP_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[Whoop] Missing OAuth credentials");
    return null;
  }

  // Check if current token is still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(`${WHOOP_AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[Whoop] Token refresh failed:", error);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - (60 * 1000); // Refresh 1 min early

    // If we got a new refresh token, log it (user should update .env)
    if (data.refresh_token && data.refresh_token !== refreshToken) {
      console.log("[Whoop] New refresh token received - update WHOOP_REFRESH_TOKEN in .env");
    }

    return accessToken;
  } catch (error) {
    console.error("[Whoop] Token refresh error:", error);
    return null;
  }
}

// Make authenticated API request
async function whoopFetch<T>(endpoint: string): Promise<T | null> {
  const token = await refreshAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${WHOOP_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`[Whoop] API error ${response.status}:`, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[Whoop] API request error:", error);
    return null;
  }
}

// Initiate OAuth flow (redirect to Whoop)
router.get("/auth", (_req: Request, res: Response) => {
  try {
    const clientId = process.env.WHOOP_CLIENT_ID;
    const redirectUri = process.env.WHOOP_REDIRECT_URI || "http://localhost:3005/api/health/whoop/callback";

    console.log("[Whoop] Auth request - clientId:", clientId ? "present" : "missing");

    if (!clientId) {
      return res.status(500).json({ error: "WHOOP_CLIENT_ID not configured" });
    }

    const scopes = [
      "offline",
      "read:recovery",
      "read:sleep",
      "read:cycles",
      "read:workout",
      "read:profile",
      "read:body_measurement",
    ].join(" ");

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const authUrl = new URL(`${WHOOP_AUTH_BASE}/auth`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);

    console.log("[Whoop] Redirecting to:", authUrl.toString());
    res.redirect(authUrl.toString());
  } catch (error) {
    console.error("[Whoop] Auth error:", error);
    res.status(500).json({ error: "Auth initialization failed", details: String(error) });
  }
});

// OAuth callback - exchange code for tokens
router.get("/callback", async (req: Request, res: Response) => {
  const { code, error, state } = req.query;

  if (error) {
    return res.status(400).json({ error: error as string });
  }

  if (!code) {
    return res.status(400).json({ error: "No authorization code provided" });
  }

  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOOP_REDIRECT_URI || "http://localhost:3005/api/health/whoop/callback";

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Whoop OAuth not configured" });
  }

  try {
    const response = await fetch(`${WHOOP_AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(400).json({ error: "Token exchange failed", details: errorData });
    }

    const data = await response.json();

    // Store tokens
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    // Show the refresh token to user so they can save it
    res.send(`
      <html>
        <head><title>Whoop Connected</title></head>
        <body style="font-family: system-ui; padding: 2rem; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Whoop Connected Successfully!</h1>
          <p>Save this refresh token to your <code>.env</code> file:</p>
          <pre style="background: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;">
WHOOP_REFRESH_TOKEN=${data.refresh_token}</pre>
          <p style="color: #6b7280; margin-top: 1rem;">
            You can close this window and restart the server with the new token.
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("[Whoop] OAuth callback error:", error);
    res.status(500).json({ error: "OAuth callback failed" });
  }
});

// Get today's recovery data
router.get("/recovery", async (_req: Request, res: Response) => {
  // Check cache
  if (recoveryCache && Date.now() - recoveryCache.timestamp < CACHE_TTL) {
    return res.json(recoveryCache.data);
  }

  if (!process.env.WHOOP_REFRESH_TOKEN) {
    return res.status(503).json({
      error: "Whoop not connected",
      authUrl: "/api/health/whoop/auth",
    });
  }

  try {
    // Get recovery for today
    const today = getAESTDate();

    // Whoop API returns array of recovery records
    interface WhoopRecoveryResponse {
      records: Array<{
        cycle_id: number;
        score: {
          recovery_score: number;
          resting_heart_rate: number;
          hrv_rmssd_milli: number;
          spo2_percentage?: number;
          skin_temp_celsius?: number;
        };
        created_at: string;
      }>;
    }

    const data = await whoopFetch<WhoopRecoveryResponse>(
      `/v1/recovery?start=${today}&end=${today}`
    );

    if (!data || !data.records || data.records.length === 0) {
      return res.status(404).json({ error: "No recovery data for today" });
    }

    const latestRecovery = data.records[0];

    // Also fetch sleep data for sleep score
    interface WhoopSleepResponse {
      records: Array<{
        id: number;
        score: {
          sleep_performance_percentage: number;
          respiratory_rate: number;
        };
      }>;
    }

    const sleepData = await whoopFetch<WhoopSleepResponse>(
      `/v1/activity/sleep?start=${today}&end=${today}`
    );

    // And fetch cycle for strain
    interface WhoopCycleResponse {
      records: Array<{
        id: number;
        score: {
          strain: number;
        };
      }>;
    }

    const cycleData = await whoopFetch<WhoopCycleResponse>(
      `/v1/cycle?start=${today}&end=${today}`
    );

    const recovery: WhoopRecovery = {
      score: Math.round(latestRecovery.score.recovery_score),
      hrvMs: Math.round(latestRecovery.score.hrv_rmssd_milli),
      restingHeartRate: Math.round(latestRecovery.score.resting_heart_rate),
      sleepScore: sleepData?.records?.[0]?.score?.sleep_performance_percentage ?? 0,
      strain: cycleData?.records?.[0]?.score?.strain ?? 0,
      respiratoryRate: sleepData?.records?.[0]?.score?.respiratory_rate ?? 0,
      spo2Percent: latestRecovery.score.spo2_percentage,
      skinTempCelsius: latestRecovery.score.skin_temp_celsius,
      date: today,
    };

    // Update cache
    recoveryCache = { data: recovery, timestamp: Date.now() };

    res.json(recovery);
  } catch (error) {
    console.error("[Whoop] Recovery fetch error:", error);
    res.status(500).json({ error: "Failed to fetch recovery data" });
  }
});

// Get sleep data
router.get("/sleep", async (_req: Request, res: Response) => {
  // Check cache
  if (sleepCache && Date.now() - sleepCache.timestamp < CACHE_TTL) {
    return res.json(sleepCache.data);
  }

  if (!process.env.WHOOP_REFRESH_TOKEN) {
    return res.status(503).json({
      error: "Whoop not connected",
      authUrl: "/api/health/whoop/auth",
    });
  }

  try {
    const today = getAESTDate();

    interface WhoopSleepDetailResponse {
      records: Array<{
        id: number;
        score: {
          stage_summary: {
            total_in_bed_time_milli: number;
            total_awake_time_milli: number;
            total_no_data_time_milli: number;
            total_light_sleep_time_milli: number;
            total_slow_wave_sleep_time_milli: number;
            total_rem_sleep_time_milli: number;
            sleep_cycle_count: number;
            disturbance_count: number;
          };
          sleep_needed: {
            baseline_milli: number;
            need_from_sleep_debt_milli: number;
            need_from_recent_strain_milli: number;
          };
          sleep_performance_percentage: number;
          sleep_consistency_percentage: number;
          sleep_efficiency_percentage: number;
        };
        start: string;
        end: string;
      }>;
    }

    const data = await whoopFetch<WhoopSleepDetailResponse>(
      `/v1/activity/sleep?start=${today}&end=${today}`
    );

    if (!data || !data.records || data.records.length === 0) {
      return res.status(404).json({ error: "No sleep data for today" });
    }

    const latestSleep = data.records[0];
    const stages = latestSleep.score.stage_summary;

    const sleepData: WhoopSleepData = {
      qualityDuration: Math.round((stages.total_slow_wave_sleep_time_milli + stages.total_rem_sleep_time_milli) / 60000),
      totalDuration: Math.round(stages.total_in_bed_time_milli / 60000),
      remDuration: Math.round(stages.total_rem_sleep_time_milli / 60000),
      deepDuration: Math.round(stages.total_slow_wave_sleep_time_milli / 60000),
      lightDuration: Math.round(stages.total_light_sleep_time_milli / 60000),
      awakeDuration: Math.round(stages.total_awake_time_milli / 60000),
      sleepEfficiency: Math.round(latestSleep.score.sleep_efficiency_percentage),
      date: today,
    };

    // Update cache
    sleepCache = { data: sleepData, timestamp: Date.now() };

    res.json(sleepData);
  } catch (error) {
    console.error("[Whoop] Sleep fetch error:", error);
    res.status(500).json({ error: "Failed to fetch sleep data" });
  }
});

// Get historical recovery data (for trends)
router.get("/history", async (req: Request, res: Response) => {
  if (!process.env.WHOOP_REFRESH_TOKEN) {
    return res.status(503).json({
      error: "Whoop not connected",
      authUrl: "/api/health/whoop/auth",
    });
  }

  const days = parseInt(req.query.days as string) || 7;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  try {
    interface WhoopRecoveryResponse {
      records: Array<{
        cycle_id: number;
        score: {
          recovery_score: number;
          resting_heart_rate: number;
          hrv_rmssd_milli: number;
        };
        created_at: string;
      }>;
    }

    const data = await whoopFetch<WhoopRecoveryResponse>(
      `/v1/recovery?start=${start}&end=${end}`
    );

    if (!data || !data.records) {
      return res.json({ history: [] });
    }

    const history = data.records.map((record) => ({
      date: record.created_at.split("T")[0],
      recoveryScore: Math.round(record.score.recovery_score),
      hrv: Math.round(record.score.hrv_rmssd_milli),
      restingHr: Math.round(record.score.resting_heart_rate),
    }));

    res.json({ history });
  } catch (error) {
    console.error("[Whoop] History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Connection status check
router.get("/status", async (_req: Request, res: Response) => {
  const hasCredentials = !!(
    process.env.WHOOP_CLIENT_ID &&
    process.env.WHOOP_CLIENT_SECRET &&
    process.env.WHOOP_REFRESH_TOKEN
  );

  if (!hasCredentials) {
    return res.json({
      connected: false,
      authUrl: "/api/health/whoop/auth",
    });
  }

  // Try to refresh token to verify connection
  const token = await refreshAccessToken();

  res.json({
    connected: !!token,
    authUrl: token ? null : "/api/health/whoop/auth",
  });
});

export default router;
