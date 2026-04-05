import { Router, Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import type { EightSleepData, EightSleepDeviceStatus } from "../../../shared/types/health.ts";
import {
  getEightSleepHistory as getDbHistory,
  getEightSleepForDateRange,
  getEightSleepCount,
} from "../../db/healthData.ts";

const execAsync = promisify(exec);
const router = Router();

// Path to eightctl binary
const EIGHTCTL_PATH = `${process.env.HOME}/go/bin/eightctl`;

// Try to get data using eightctl CLI
async function getEightSleepViaCtl(): Promise<{ status: any; sleep: any } | null> {
  try {
    const { stdout: statusOut } = await execAsync(`${EIGHTCTL_PATH} status --output json --quiet`);
    const status = JSON.parse(statusOut);

    return { status, sleep: null };
  } catch (error) {
    console.error("[EightSleep] eightctl failed:", error);
    return null;
  }
}

// Eight Sleep API endpoints - V2 OAuth2 flow
const EIGHT_SLEEP_AUTH_API = "https://auth-api.8slp.net/v1";
const EIGHT_SLEEP_CLIENT_API = "https://client-api.8slp.net/v1";
const EIGHT_SLEEP_CLIENT_ID = process.env.EIGHT_SLEEP_CLIENT_ID;
const EIGHT_SLEEP_CLIENT_SECRET = process.env.EIGHT_SLEEP_CLIENT_SECRET;

// Cache for authentication and data
let accessToken: string | null = null;
let refreshToken: string | null = null;
let userId: string | null = null;
let tokenExpiry: number = 0;
let sleepCache: { data: EightSleepData; timestamp: number } | null = null;
let statusCache: { data: EightSleepDeviceStatus; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper to get date in AEST
function getAESTDate(): string {
  const now = new Date();
  const aest = new Date(now.getTime() + (10 * 60 * 60 * 1000)); // UTC+10
  return aest.toISOString().split("T")[0];
}

// Authenticate with Eight Sleep V2 OAuth2 flow
async function authenticate(): Promise<boolean> {
  const email = process.env.EIGHT_SLEEP_EMAIL;
  const password = process.env.EIGHT_SLEEP_PASSWORD;

  if (!email || !password) {
    console.error("[EightSleep] Missing email/password credentials");
    return false;
  }

  if (!EIGHT_SLEEP_CLIENT_ID || !EIGHT_SLEEP_CLIENT_SECRET) {
    console.error("[EightSleep] Missing client ID or client secret");
    return false;
  }

  // Check if current token is still valid (with 2 minute buffer)
  if (accessToken && userId && Date.now() < tokenExpiry - 120000) {
    return true;
  }

  try {
    console.log("[EightSleep] Authenticating via OAuth2...");

    // Use OAuth2 password grant flow
    const response = await fetch(`${EIGHT_SLEEP_AUTH_API}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CommandCentre/1.0.0",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: EIGHT_SLEEP_CLIENT_ID,
        client_secret: EIGHT_SLEEP_CLIENT_SECRET,
        grant_type: "password",
        username: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[EightSleep] OAuth2 auth failed:", response.status, error);
      return false;
    }

    const data = await response.json();
    console.log("[EightSleep] OAuth2 auth response keys:", Object.keys(data));

    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    userId = data.userId;
    // expires_in is in seconds, convert to milliseconds
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    console.log("[EightSleep] Auth successful - userId:", userId ? "present" : "missing", "token:", accessToken ? "present" : "missing");
    return !!(accessToken && userId);
  } catch (error) {
    console.error("[EightSleep] Auth error:", error);
    return false;
  }
}

// Make authenticated API request
async function eightSleepFetch<T>(endpoint: string): Promise<T | null> {
  const authenticated = await authenticate();
  if (!authenticated || !accessToken) {
    console.error("[EightSleep] Not authenticated for request:", endpoint);
    return null;
  }

  try {
    console.log("[EightSleep] Fetching:", `${EIGHT_SLEEP_CLIENT_API}${endpoint}`);
    const response = await fetch(`${EIGHT_SLEEP_CLIENT_API}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "CommandCentre/1.0.0",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("[EightSleep] Response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear and retry
        console.log("[EightSleep] Token expired, retrying auth...");
        accessToken = null;
        refreshToken = null;
        tokenExpiry = 0;
        const retryAuth = await authenticate();
        if (retryAuth) {
          return eightSleepFetch(endpoint);
        }
      }
      const errorText = await response.text();
      console.error(`[EightSleep] API error ${response.status}:`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[EightSleep] API request error:", error);
    return null;
  }
}

// Get latest sleep data
router.get("/sleep", async (_req: Request, res: Response) => {
  // Check cache
  if (sleepCache && Date.now() - sleepCache.timestamp < CACHE_TTL) {
    return res.json(sleepCache.data);
  }

  if (!process.env.EIGHT_SLEEP_EMAIL || !process.env.EIGHT_SLEEP_PASSWORD) {
    return res.status(503).json({ error: "Eight Sleep not configured" });
  }

  try {
    // Ensure we're authenticated first to get userId
    const authenticated = await authenticate();
    if (!authenticated || !userId) {
      return res.status(503).json({ error: "Eight Sleep authentication failed" });
    }

    console.log("[EightSleep] Fetching user info for userId:", userId);

    // First get user info to get device ID
    interface UserResponse {
      user: {
        currentDevice: {
          id: string;
          side: string;
        };
      };
    }

    const userInfo = await eightSleepFetch<UserResponse>(`/users/${userId}`);
    console.log("[EightSleep] User info response:", userInfo ? "received" : "null");
    if (!userInfo) {
      return res.status(500).json({ error: "Failed to fetch user info" });
    }

    const deviceId = userInfo.user.currentDevice?.id;
    const side = userInfo.user.currentDevice?.side || "left";

    if (!deviceId) {
      return res.status(404).json({ error: "No device found" });
    }

    // Get sleep sessions
    interface SleepSessionResponse {
      intervals: Array<{
        id: string;
        ts: string;
        stages: Array<{
          stage: string;
          duration: number;
        }>;
        score: number;
        sleepFitnessScore?: {
          total: number;
          sleepDurationSeconds?: { score: number };
          latencyAsleepSeconds?: { score: number };
          latencyOutSeconds?: { score: number };
          wakeupConsistency?: { score: number };
        };
        timeseries: {
          hrv: Array<[string, number]>;
          heartRate: Array<[string, number]>;
          respiratoryRate: Array<[string, number]>;
          roomTemperature: Array<[string, number]>;
          bedTemperature: Array<[string, number]>;
          tnt: Array<[string, number]>;
        };
      }>;
    }

    const today = getAESTDate();
    const sleepSessions = await eightSleepFetch<SleepSessionResponse>(
      `/users/${userId}/intervals?from=${today}T00:00:00Z&to=${today}T23:59:59Z`
    );

    if (!sleepSessions || sleepSessions.intervals.length === 0) {
      // Try yesterday if no data today
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const yesterdaySessions = await eightSleepFetch<SleepSessionResponse>(
        `/users/${userId}/intervals?from=${yesterdayStr}T00:00:00Z&to=${yesterdayStr}T23:59:59Z`
      );

      if (!yesterdaySessions || yesterdaySessions.intervals.length === 0) {
        return res.status(404).json({ error: "No recent sleep data" });
      }

      return processSleepData(yesterdaySessions, yesterdayStr, res);
    }

    return processSleepData(sleepSessions, today, res);
  } catch (error) {
    console.error("[EightSleep] Sleep fetch error:", error);
    res.status(500).json({ error: "Failed to fetch sleep data" });
  }
});

interface StageSummary {
  totalDuration: number;
  sleepDuration: number;
  awakeDuration: number;
  lightDuration: number;
  deepDuration: number;
  remDuration: number;
  deepPercentOfSleep: number;
  remPercentOfSleep: number;
  lightPercentOfSleep: number;
  wasoDuration: number;
}

// Calculate sleep score from stage summary if API doesn't provide one
function calculateSleepScore(summary: StageSummary | undefined): number {
  if (!summary) return 0;

  let score = 0;

  // 1. Duration score (max 30) - target 7-8 hours
  const sleepHours = summary.sleepDuration / 3600;
  if (sleepHours >= 7 && sleepHours <= 9) {
    score += 30;
  } else if (sleepHours >= 6 && sleepHours < 7) {
    score += 20;
  } else if (sleepHours >= 5 && sleepHours < 6) {
    score += 10;
  } else if (sleepHours > 9) {
    score += 25;
  }

  // 2. Deep sleep score (max 25) - target 15-25%
  const deepPct = summary.deepPercentOfSleep * 100;
  if (deepPct >= 15 && deepPct <= 25) {
    score += 25;
  } else if (deepPct >= 10 && deepPct < 15) {
    score += 15;
  } else if (deepPct > 25 && deepPct <= 30) {
    score += 20;
  } else if (deepPct >= 5 && deepPct < 10) {
    score += 8;
  }

  // 3. REM sleep score (max 25) - target 20-25%
  const remPct = summary.remPercentOfSleep * 100;
  if (remPct >= 20 && remPct <= 25) {
    score += 25;
  } else if (remPct >= 15 && remPct < 20) {
    score += 18;
  } else if (remPct > 25 && remPct <= 35) {
    score += 22;
  } else if (remPct >= 10 && remPct < 15) {
    score += 10;
  } else if (remPct > 35) {
    score += 15;
  }

  // 4. Sleep efficiency score (max 20) - low WASO is good
  const wasoMinutes = summary.wasoDuration / 60;
  if (wasoMinutes < 15) {
    score += 20;
  } else if (wasoMinutes < 30) {
    score += 15;
  } else if (wasoMinutes < 45) {
    score += 10;
  } else if (wasoMinutes < 60) {
    score += 5;
  }

  return Math.min(100, Math.round(score));
}

function processSleepData(
  data: { intervals: Array<{
    id: string;
    ts: string;
    stages: Array<{ stage: string; duration: number }>;
    score: number;
    sleepFitnessScore?: {
      total: number;
    };
    stageSummary?: StageSummary;
    timeseries: {
      hrv: Array<[string, number]>;
      heartRate: Array<[string, number]>;
      respiratoryRate: Array<[string, number]>;
      roomTemperature: Array<[string, number]>;
      bedTemperature: Array<[string, number]>;
      tnt: Array<[string, number]>;
    };
  }> },
  date: string,
  res: Response
) {
  const latest = data.intervals[0];
  const timeseries = latest.timeseries;

  // Use sleepFitnessScore.total as primary, then calculate from stageSummary
  let sleepScore = latest.sleepFitnessScore?.total ?? latest.score ?? 0;
  if (sleepScore === 0 && latest.stageSummary) {
    sleepScore = calculateSleepScore(latest.stageSummary);
  }

  // Calculate averages from timeseries
  const avgHrv = timeseries.hrv?.length
    ? timeseries.hrv.reduce((sum, [_, v]) => sum + v, 0) / timeseries.hrv.length
    : 0;
  const avgHr = timeseries.heartRate?.length
    ? timeseries.heartRate.reduce((sum, [_, v]) => sum + v, 0) / timeseries.heartRate.length
    : 0;
  const avgRespRate = timeseries.respiratoryRate?.length
    ? timeseries.respiratoryRate.reduce((sum, [_, v]) => sum + v, 0) / timeseries.respiratoryRate.length
    : 0;
  const avgRoomTemp = timeseries.roomTemperature?.length
    ? timeseries.roomTemperature.reduce((sum, [_, v]) => sum + v, 0) / timeseries.roomTemperature.length
    : 0;
  const avgBedTemp = timeseries.bedTemperature?.length
    ? timeseries.bedTemperature.reduce((sum, [_, v]) => sum + v, 0) / timeseries.bedTemperature.length
    : 0;
  const tossTurnCount = timeseries.tnt?.length || 0;

  // Calculate durations from stages
  let awakeTime = 0;
  let totalTime = 0;
  for (const stage of latest.stages || []) {
    totalTime += stage.duration;
    if (stage.stage === "awake") {
      awakeTime += stage.duration;
    }
  }

  const sleepDuration = totalTime - awakeTime;

  const sleepData: EightSleepData = {
    sleepScore: Math.round(sleepScore),
    bedTemperature: Math.round(avgBedTemp * 10) / 10,
    roomTemperature: Math.round(avgRoomTemp * 10) / 10,
    timeInBed: Math.round(totalTime / 60), // Convert seconds to minutes
    sleepDuration: Math.round(sleepDuration / 60),
    awakeTime: Math.round(awakeTime / 60),
    tossTurnCount,
    hrvAvg: Math.round(avgHrv),
    respiratoryRate: Math.round(avgRespRate * 10) / 10,
    heartRate: Math.round(avgHr),
    date,
  };

  // Update cache
  sleepCache = { data: sleepData, timestamp: Date.now() };

  res.json(sleepData);
}

// Get device status (temperature settings)
router.get("/status", async (_req: Request, res: Response) => {
  // Check cache
  if (statusCache && Date.now() - statusCache.timestamp < CACHE_TTL) {
    return res.json(statusCache.data);
  }

  if (!process.env.EIGHT_SLEEP_EMAIL || !process.env.EIGHT_SLEEP_PASSWORD) {
    return res.status(503).json({ error: "Eight Sleep not configured" });
  }

  try {
    // Ensure authenticated first
    const authenticated = await authenticate();
    if (!authenticated || !userId) {
      return res.status(503).json({ error: "Eight Sleep authentication failed" });
    }

    interface UserResponse {
      user: {
        currentDevice: {
          id: string;
        };
      };
    }

    const userInfo = await eightSleepFetch<UserResponse>(`/users/${userId}`);
    if (!userInfo?.user.currentDevice?.id) {
      return res.status(404).json({ error: "No device found" });
    }

    const deviceId = userInfo.user.currentDevice.id;

    interface DeviceResponse {
      result: {
        leftHeatingLevel: number;
        leftTargetHeatingLevel: number;
        leftNowHeating: boolean;
        rightHeatingLevel: number;
        rightTargetHeatingLevel: number;
        rightNowHeating: boolean;
        priming: boolean;
      };
    }

    const deviceStatus = await eightSleepFetch<DeviceResponse>(`/devices/${deviceId}`);
    if (!deviceStatus) {
      return res.status(500).json({ error: "Failed to fetch device status" });
    }

    // Convert heating level (-100 to 100) to approximate temperature
    // -100 = ~15°C, 0 = ~27°C, 100 = ~43°C
    const levelToTemp = (level: number) => Math.round(27 + (level * 0.16));

    const status: EightSleepDeviceStatus = {
      leftSide: {
        currentTemp: levelToTemp(deviceStatus.result.leftHeatingLevel),
        targetTemp: levelToTemp(deviceStatus.result.leftTargetHeatingLevel),
        isOn: deviceStatus.result.leftNowHeating,
      },
      rightSide: {
        currentTemp: levelToTemp(deviceStatus.result.rightHeatingLevel),
        targetTemp: levelToTemp(deviceStatus.result.rightTargetHeatingLevel),
        isOn: deviceStatus.result.rightNowHeating,
      },
      priming: deviceStatus.result.priming,
    };

    // Update cache
    statusCache = { data: status, timestamp: Date.now() };

    res.json(status);
  } catch (error) {
    console.error("[EightSleep] Status fetch error:", error);
    res.status(500).json({ error: "Failed to fetch device status" });
  }
});

// Get sleep history - DB-backed with optional API fallback
router.get("/history", async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  try {
    // Try DB first if we have cached data
    const dbCount = getEightSleepCount();
    if (dbCount > 0) {
      let dbData: EightSleepData[];
      if (startDate && endDate) {
        dbData = getEightSleepForDateRange(startDate, endDate);
      } else {
        dbData = getDbHistory(days);
      }

      if (dbData.length > 0) {
        // Return full data for charts
        const history = dbData.map((d) => ({
          date: d.date,
          sleepScore: d.sleepScore,
          hrvAvg: d.hrvAvg,
          sleepDuration: d.sleepDuration,
          heartRate: d.heartRate,
          bedTemperature: d.bedTemperature,
          roomTemperature: d.roomTemperature,
        }));
        return res.json({ history, source: "database" });
      }
    }

    // Fallback to API if DB empty or no credentials
    if (!process.env.EIGHT_SLEEP_EMAIL || !process.env.EIGHT_SLEEP_PASSWORD) {
      return res.json({ history: [], source: "none" });
    }

    const authenticated = await authenticate();
    if (!authenticated || !userId) {
      return res.json({ history: [], source: "none" });
    }

    const apiEndDate = new Date();
    const apiStartDate = new Date();
    apiStartDate.setDate(apiStartDate.getDate() - days);

    interface SleepSessionResponse {
      intervals: Array<{
        id: string;
        ts: string;
        score: number;
      }>;
    }

    const sessions = await eightSleepFetch<SleepSessionResponse>(
      `/users/${userId}/intervals?from=${apiStartDate.toISOString()}&to=${apiEndDate.toISOString()}`
    );

    if (!sessions) {
      return res.json({ history: [], source: "api" });
    }

    const history = sessions.intervals.map((session) => ({
      date: session.ts.split("T")[0],
      sleepScore: Math.round(session.score || 0),
    }));

    res.json({ history, source: "api" });
  } catch (error) {
    console.error("[EightSleep] History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Connection status
router.get("/connection", async (_req: Request, res: Response) => {
  const hasCredentials = !!(
    process.env.EIGHT_SLEEP_EMAIL &&
    process.env.EIGHT_SLEEP_PASSWORD
  );

  if (!hasCredentials) {
    return res.json({ connected: false });
  }

  // Skip eightctl - it uses a shared public client ID that gets rate limited
  // Go directly to API authentication
  const authenticated = await authenticate();
  res.json({ connected: authenticated, source: "api" });
});

// Endpoint using eightctl CLI (fallback)
router.get("/ctl/status", async (_req: Request, res: Response) => {
  try {
    const data = await getEightSleepViaCtl();
    if (!data) {
      return res.status(503).json({ error: "eightctl not available or failed" });
    }
    res.json(data.status);
  } catch (error) {
    console.error("[EightSleep] CTL status error:", error);
    res.status(500).json({ error: "Failed to get status via eightctl" });
  }
});

export default router;
