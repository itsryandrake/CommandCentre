import cron from "node-cron";
import {
  upsertEightSleepData,
  upsertRenphoData,
  getEightSleepCount,
  getRenphoCount,
  logHealthSyncStart,
  logHealthSyncComplete,
  logHealthSyncError,
} from "../db/healthData.ts";
import type { EightSleepData, RenphoData } from "../../shared/types/health.ts";

// ============================================================================
// Eight Sleep API Configuration
// ============================================================================

const EIGHT_SLEEP_AUTH_API = "https://auth-api.8slp.net/v1";
const EIGHT_SLEEP_CLIENT_API = "https://client-api.8slp.net/v1";
const EIGHT_SLEEP_CLIENT_ID = process.env.EIGHT_SLEEP_CLIENT_ID;
const EIGHT_SLEEP_CLIENT_SECRET = process.env.EIGHT_SLEEP_CLIENT_SECRET;

let eightSleepAccessToken: string | null = null;
let eightSleepUserId: string | null = null;
let eightSleepTokenExpiry: number = 0;

async function authenticateEightSleep(): Promise<boolean> {
  const email = process.env.EIGHT_SLEEP_EMAIL;
  const password = process.env.EIGHT_SLEEP_PASSWORD;

  if (!email || !password) {
    console.log("[HealthDataCron] Eight Sleep email/password not configured");
    return false;
  }

  if (!EIGHT_SLEEP_CLIENT_ID || !EIGHT_SLEEP_CLIENT_SECRET) {
    console.log("[HealthDataCron] Eight Sleep client ID/secret not configured");
    return false;
  }

  // Check if current token is still valid
  if (eightSleepAccessToken && eightSleepUserId && Date.now() < eightSleepTokenExpiry - 120000) {
    return true;
  }

  try {
    const response = await fetch(`${EIGHT_SLEEP_AUTH_API}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CommandCentre/1.0.0",
        Accept: "application/json",
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
      console.error("[HealthDataCron] Eight Sleep auth failed:", response.status);
      return false;
    }

    const data = await response.json();
    eightSleepAccessToken = data.access_token;
    eightSleepUserId = data.userId;
    eightSleepTokenExpiry = Date.now() + (data.expires_in * 1000);
    return !!(eightSleepAccessToken && eightSleepUserId);
  } catch (error) {
    console.error("[HealthDataCron] Eight Sleep auth error:", error);
    return false;
  }
}

async function fetchEightSleepData<T>(endpoint: string): Promise<T | null> {
  const authenticated = await authenticateEightSleep();
  if (!authenticated || !eightSleepAccessToken) return null;

  try {
    const response = await fetch(`${EIGHT_SLEEP_CLIENT_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${eightSleepAccessToken}`,
        "User-Agent": "CommandCentre/1.0.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        eightSleepAccessToken = null;
        eightSleepTokenExpiry = 0;
        const retryAuth = await authenticateEightSleep();
        if (retryAuth) return fetchEightSleepData(endpoint);
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[HealthDataCron] Eight Sleep fetch error:", error);
    return null;
  }
}

// ============================================================================
// Renpho API Configuration
// ============================================================================

import * as crypto from "crypto";

const RENPHO_API = "https://cloud.renpho.com";
const RENPHO_ENCRYPTION_KEY = "ed*wijdi$h6fe3ew";
const RENPHO_APP_VERSION = "6.6.0";
const RENPHO_PLATFORM = "android";
const RENPHO_SUCCESS_CODES = [0, 101, 200, 20000, "0", "101", "200", "20000"];

let renphoAuthToken: string | null = null;
let renphoUserId: string | null = null;
let renphoTokenExpiry: number = 0;
let renphoScaleTableName: string | null = null;
let renphoMeasurementCount: number = 0;

function aesEncrypt(plaintext: string): string {
  const cipher = crypto.createCipheriv("aes-128-ecb", RENPHO_ENCRYPTION_KEY, null);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

function aesDecrypt(ciphertext: string): string {
  const decipher = crypto.createDecipheriv("aes-128-ecb", RENPHO_ENCRYPTION_KEY, null);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

function encryptRequest(obj: Record<string, unknown>): { encryptData: string } {
  return { encryptData: aesEncrypt(JSON.stringify(obj)) };
}

function encryptEmptyBytes(): { encryptData: string } {
  const cipher = crypto.createCipheriv("aes-128-ecb", RENPHO_ENCRYPTION_KEY, null);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(Buffer.alloc(0)), cipher.final()]);
  return { encryptData: encrypted.toString("base64") };
}

async function authenticateRenpho(): Promise<boolean> {
  const email = process.env.RENPHO_EMAIL;
  const password = process.env.RENPHO_PASSWORD;

  if (!email || !password) {
    console.log("[HealthDataCron] Renpho credentials not configured");
    return false;
  }

  if (renphoAuthToken && renphoUserId && Date.now() < renphoTokenExpiry) {
    return true;
  }

  try {
    const loginPayload = {
      questionnaire: {},
      login: {
        password,
        areaCode: "AU",
        appRevision: RENPHO_APP_VERSION,
        cellphoneType: "PythonScript",
        systemType: "11",
        email,
        platform: RENPHO_PLATFORM,
      },
      bindingList: {
        deviceTypes: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"],
      },
    };

    const response = await fetch(`${RENPHO_API}/renpho-aggregation/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `Renpho/${RENPHO_APP_VERSION} (Android)`,
        Accept: "application/json",
        appVersion: RENPHO_APP_VERSION,
        platform: RENPHO_PLATFORM,
      },
      body: JSON.stringify(encryptRequest(loginPayload)),
    });

    const rawData = await response.json();
    if (!RENPHO_SUCCESS_CODES.includes(rawData.code)) {
      console.error("[HealthDataCron] Renpho auth failed:", rawData.msg || rawData.code);
      return false;
    }

    let loginInfo: { login?: { token?: string; id?: number | string }; token?: string } = rawData.data;
    let rawUserIdStr: string | null = null;

    if (typeof rawData.data === "string") {
      const rawDecrypted = aesDecrypt(rawData.data);
      // Extract userId as string to preserve precision for large numbers
      const userIdMatch = rawDecrypted.match(/"id"\s*:\s*(\d+)/);
      if (userIdMatch) {
        rawUserIdStr = userIdMatch[1];
      }
      loginInfo = JSON.parse(rawDecrypted);
    }

    const loginData = loginInfo?.login;
    renphoAuthToken = loginData?.token || loginInfo?.token || null;
    // Use regex-extracted userId if available (preserves precision for large numbers)
    renphoUserId = rawUserIdStr || String(loginData?.id || "");
    renphoTokenExpiry = Date.now() + (24 * 60 * 60 * 1000);

    return !!renphoAuthToken;
  } catch (error) {
    console.error("[HealthDataCron] Renpho auth error:", error);
    return false;
  }
}

async function getRenphoDeviceInfo(forceRefresh: boolean = false): Promise<boolean> {
  if (renphoScaleTableName && !forceRefresh) return true;

  const authenticated = await authenticateRenpho();
  if (!authenticated || !renphoAuthToken || !renphoUserId) return false;

  const bodyFormats = [encryptEmptyBytes, () => encryptRequest({})];

  for (const bodyFn of bodyFormats) {
    try {
      const response = await fetch(`${RENPHO_API}/renpho-aggregation/device/count`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": `Renpho/${RENPHO_APP_VERSION} (Android)`,
          Accept: "application/json",
          appVersion: RENPHO_APP_VERSION,
          platform: RENPHO_PLATFORM,
          token: renphoAuthToken,
          userId: renphoUserId,
        },
        body: JSON.stringify(bodyFn()),
      });

      const rawData = await response.json();
      if (!RENPHO_SUCCESS_CODES.includes(rawData.code)) continue;

      let deviceData: unknown = rawData.data;
      if (typeof rawData.data === "string") {
        deviceData = JSON.parse(aesDecrypt(rawData.data));
      }

      let scales: Array<{ tableName?: string; count?: number }> = [];
      if (Array.isArray(deviceData)) {
        scales = deviceData;
      } else if (deviceData && typeof deviceData === "object") {
        const data = deviceData as { scale?: Array<{ tableName?: string; count?: number }> };
        scales = data.scale || [];
      }

      // Find scale with most measurements
      const scalesWithData = scales.filter((d) => d.tableName && (d.count ?? 0) > 0);
      if (scalesWithData.length > 0) {
        const primaryScale = scalesWithData.reduce((best, current) =>
          (current.count ?? 0) > (best.count ?? 0) ? current : best
        );
        renphoScaleTableName = primaryScale.tableName!;
        renphoMeasurementCount = primaryScale.count ?? 0;
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

async function fetchRenphoMeasurements(pageSize: number = 100): Promise<RenphoData[]> {
  const authenticated = await authenticateRenpho();
  if (!authenticated || !renphoAuthToken || !renphoUserId) return [];

  // Refresh device info to get scale with most measurements
  renphoScaleTableName = null;
  await getRenphoDeviceInfo(true);

  if (!renphoScaleTableName || renphoMeasurementCount === 0) {
    console.log("[HealthDataCron] No Renpho scale found to fetch from");
    return [];
  }

  type RenphoMeasurement = {
    timeStamp?: number;
    createTime?: number;
    weight?: number;
    bodyfat?: number;
    bodyFat?: number;
    water?: number;
    bone?: number;
    muscle?: number;
    visfat?: number;
    visFat?: number;
    bmi?: number;
    bodyage?: number;
    bodyAge?: number;
    bmr?: number;
    protein?: number;
    subfat?: number;
    subFat?: number;
  };

  const allMeasurements: RenphoMeasurement[] = [];
  const totalPages = Math.ceil(renphoMeasurementCount / pageSize);
  console.log(`[HealthDataCron] Fetching ${totalPages} pages from ${renphoScaleTableName} (${renphoMeasurementCount} measurements)`);

  for (let page = 1; page <= totalPages; page++) {
    const measurementParams: Record<string, unknown> = {
      pageNum: page,
      pageSize: pageSize,
      tableName: renphoScaleTableName,
    };

    try {
      const response = await fetch(`${RENPHO_API}/RenphoHealth/scale/queryAllMeasureDataList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": `Renpho/${RENPHO_APP_VERSION} (Android)`,
          Accept: "application/json",
          appVersion: RENPHO_APP_VERSION,
          platform: RENPHO_PLATFORM,
          token: renphoAuthToken!,
          userId: renphoUserId!,
        },
        body: JSON.stringify(encryptRequest(measurementParams)),
      });

      const rawData = await response.json();
      if (!RENPHO_SUCCESS_CODES.includes(rawData.code)) {
        console.log(`[HealthDataCron] Renpho API error: code=${rawData.code} msg=${rawData.msg}`);
        continue;
      }

      let data = rawData.data;
      if (typeof data === "string") {
        const decrypted = aesDecrypt(data);
        data = JSON.parse(decrypted);
      }

      let measurements: RenphoMeasurement[] = [];
      if (Array.isArray(data)) {
        measurements = data;
      } else if (data && "list" in data) {
        measurements = data.list || [];
      }

      allMeasurements.push(...measurements);
    } catch (error) {
      console.error(`[HealthDataCron] Error fetching Renpho page ${page}:`, error);
    }
  }

  console.log(`[HealthDataCron] Fetched ${allMeasurements.length} total Renpho measurements`);

  return allMeasurements
    .filter((m) => m.weight && (m.timeStamp || m.createTime))
    .map((m) => {
      const timestamp = m.timeStamp ?? m.createTime ?? 0;
      const bodyFat = m.bodyfat ?? m.bodyFat ?? 0;
      const visFat = m.visfat ?? m.visFat ?? 0;
      const bodyAge = m.bodyage ?? m.bodyAge ?? 0;
      const subFat = m.subfat ?? m.subFat;

      return {
        weight: Math.round((m.weight || 0) * 100) / 100,
        bodyFatPercent: Math.round(bodyFat * 10) / 10,
        muscleMass: m.muscle ? Math.round(m.muscle * 100) / 100 : 0,
        boneMass: m.bone ? Math.round(m.bone * 100) / 100 : 0,
        waterPercent: m.water ? Math.round(m.water * 10) / 10 : 0,
        visceralFat: visFat ? Math.round(visFat) : 0,
        bmi: m.bmi ? Math.round(m.bmi * 10) / 10 : 0,
        metabolicAge: bodyAge ? Math.round(bodyAge) : 0,
        bmr: m.bmr ? Math.round(m.bmr) : 0,
        proteinPercent: m.protein ? Math.round(m.protein * 10) / 10 : undefined,
        subcutaneousFatPercent: subFat ? Math.round(subFat * 10) / 10 : undefined,
        timestamp: new Date(timestamp * 1000).toISOString(),
      } as RenphoData;
    });
}

// ============================================================================
// Sync Functions
// ============================================================================

async function syncEightSleepData(days: number = 7): Promise<number> {
  console.log(`[HealthDataCron] Syncing Eight Sleep data (${days} days)...`);

  const authenticated = await authenticateEightSleep();
  if (!authenticated || !eightSleepUserId) {
    console.log("[HealthDataCron] Eight Sleep not authenticated, skipping");
    return 0;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

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

  interface SleepInterval {
    ts: string;
    score: number;
    sleepFitnessScore?: {
      total: number;
    };
    stageSummary?: StageSummary;
    stages: Array<{ stage: string; duration: number }>;
    timeseries: {
      hrv: Array<[string, number]>;
      heartRate: Array<[string, number]>;
      respiratoryRate: Array<[string, number]>;
      roomTemperature: Array<[string, number]>;
      bedTemperature: Array<[string, number]>;
      tnt: Array<[string, number]>;
    };
  }

  // Calculate sleep score from stage summary if API doesn't provide one
  function calculateSleepScore(summary: StageSummary | undefined): number {
    if (!summary) return 0;

    // Score components (total max ~100)
    let score = 0;

    // 1. Duration score (max 30) - target 7-8 hours (25200-28800 seconds)
    const sleepHours = summary.sleepDuration / 3600;
    if (sleepHours >= 7 && sleepHours <= 9) {
      score += 30;
    } else if (sleepHours >= 6 && sleepHours < 7) {
      score += 20;
    } else if (sleepHours >= 5 && sleepHours < 6) {
      score += 10;
    } else if (sleepHours > 9) {
      score += 25; // Slight penalty for oversleeping
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
      score += 22; // Above target is okay
    } else if (remPct >= 10 && remPct < 15) {
      score += 10;
    } else if (remPct > 35) {
      score += 15; // Too much REM
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

  const sessions = await fetchEightSleepData<{ intervals: SleepInterval[] }>(
    `/users/${eightSleepUserId}/intervals?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
  );

  if (!sessions || !sessions.intervals) {
    console.log("[HealthDataCron] No Eight Sleep intervals found");
    return 0;
  }

  let synced = 0;

  for (const interval of sessions.intervals) {
    const date = interval.ts.split("T")[0];
    const timeseries = interval.timeseries;


    // Use sleepFitnessScore.total as primary score, fallback to calculated score from stageSummary
    let sleepScore = interval.sleepFitnessScore?.total ?? interval.score ?? 0;
    if (sleepScore === 0 && interval.stageSummary) {
      sleepScore = calculateSleepScore(interval.stageSummary);
    }

    // Calculate averages
    const avgHrv = timeseries.hrv?.length
      ? timeseries.hrv.reduce((sum, [, v]) => sum + v, 0) / timeseries.hrv.length
      : 0;
    const avgHr = timeseries.heartRate?.length
      ? timeseries.heartRate.reduce((sum, [, v]) => sum + v, 0) / timeseries.heartRate.length
      : 0;
    const avgRespRate = timeseries.respiratoryRate?.length
      ? timeseries.respiratoryRate.reduce((sum, [, v]) => sum + v, 0) / timeseries.respiratoryRate.length
      : 0;
    const avgRoomTemp = timeseries.roomTemperature?.length
      ? timeseries.roomTemperature.reduce((sum, [, v]) => sum + v, 0) / timeseries.roomTemperature.length
      : 0;
    const avgBedTemp = timeseries.bedTemperature?.length
      ? timeseries.bedTemperature.reduce((sum, [, v]) => sum + v, 0) / timeseries.bedTemperature.length
      : 0;
    const tossTurnCount = timeseries.tnt?.length || 0;

    // Calculate durations
    let awakeTime = 0;
    let totalTime = 0;
    for (const stage of interval.stages || []) {
      totalTime += stage.duration;
      if (stage.stage === "awake") awakeTime += stage.duration;
    }

    const sleepData: EightSleepData = {
      date,
      sleepScore: Math.round(sleepScore),
      bedTemperature: Math.round(avgBedTemp * 10) / 10,
      roomTemperature: Math.round(avgRoomTemp * 10) / 10,
      timeInBed: Math.round(totalTime / 60),
      sleepDuration: Math.round((totalTime - awakeTime) / 60),
      awakeTime: Math.round(awakeTime / 60),
      tossTurnCount,
      hrvAvg: Math.round(avgHrv),
      respiratoryRate: Math.round(avgRespRate * 10) / 10,
      heartRate: Math.round(avgHr),
    };

    upsertEightSleepData(sleepData);
    synced++;
  }

  console.log(`[HealthDataCron] Synced ${synced} Eight Sleep records`);
  return synced;
}

async function syncRenphoData(): Promise<number> {
  console.log("[HealthDataCron] Syncing Renpho data...");

  const measurements = await fetchRenphoMeasurements(200);

  if (measurements.length === 0) {
    console.log("[HealthDataCron] No Renpho measurements found");
    return 0;
  }

  let synced = 0;
  for (const measurement of measurements) {
    upsertRenphoData(measurement);
    synced++;
  }

  console.log(`[HealthDataCron] Synced ${synced} Renpho records`);
  return synced;
}

async function runHealthSync(): Promise<void> {
  console.log(`[HealthDataCron] Starting health data sync at ${new Date().toISOString()}`);

  // Sync Eight Sleep
  const eightSleepLogId = logHealthSyncStart("eight_sleep");
  try {
    const count = await syncEightSleepData(7);
    logHealthSyncComplete(eightSleepLogId, count);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logHealthSyncError(eightSleepLogId, msg);
    console.error("[HealthDataCron] Eight Sleep sync failed:", msg);
  }

  // Sync Renpho
  const renphoLogId = logHealthSyncStart("renpho");
  try {
    const count = await syncRenphoData();
    logHealthSyncComplete(renphoLogId, count);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logHealthSyncError(renphoLogId, msg);
    console.error("[HealthDataCron] Renpho sync failed:", msg);
  }

  console.log("[HealthDataCron] Health data sync complete");
}

// ============================================================================
// Cron Job Startup
// ============================================================================

export function startHealthDataCron(): void {
  // Schedule: "0 6,18 * * *" (6 AM and 6 PM daily)
  // Note: Server should be configured for AEST timezone
  const schedule = "0 6,18 * * *";

  cron.schedule(schedule, async () => {
    console.log(`[HealthDataCron] Scheduled sync triggered at ${new Date().toISOString()}`);
    await runHealthSync();
  });

  console.log(`[HealthDataCron] Cron job scheduled: ${schedule} (6 AM, 6 PM daily)`);

  // Run initial backfill if tables are empty
  const eightSleepCount = getEightSleepCount();
  const renphoCount = getRenphoCount();

  if (eightSleepCount === 0 || renphoCount === 0) {
    console.log("[HealthDataCron] Cache empty, running initial backfill (90 days)...");
    // Run initial sync with 90 day backfill for Eight Sleep
    (async () => {
      if (eightSleepCount === 0) {
        const logId = logHealthSyncStart("eight_sleep_backfill");
        try {
          const count = await syncEightSleepData(90);
          logHealthSyncComplete(logId, count);
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          logHealthSyncError(logId, msg);
        }
      }
      if (renphoCount === 0) {
        const logId = logHealthSyncStart("renpho_backfill");
        try {
          const count = await syncRenphoData();
          logHealthSyncComplete(logId, count);
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          logHealthSyncError(logId, msg);
        }
      }
    })();
  }
}

// Export sync function for manual triggering
export { runHealthSync };
