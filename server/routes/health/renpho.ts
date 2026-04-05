import { Router, Request, Response } from "express";
import * as crypto from "crypto";
import type { RenphoData, RenphoTrend, RenphoTrendExtended } from "../../../shared/types/health.ts";
import {
  getRenphoHistory as getDbHistory,
  getRenphoForDateRange,
  getRenphoCount,
  getAllRenphoHistory,
} from "../../db/healthData.ts";

const router = Router();

// Renpho API - New cloud.renpho.com endpoint (2024+)
const RENPHO_API = "https://cloud.renpho.com";
const ENCRYPTION_KEY = "ed*wijdi$h6fe3ew"; // 16-byte AES key
const APP_VERSION = "6.6.0";
const PLATFORM = "android";

// Valid response codes
const SUCCESS_CODES = [0, 101, 200, 20000, "0", "101", "200", "20000"];

// Cache for authentication and data
let authToken: string | null = null;
let userId: string | null = null;
let tokenExpiry: number = 0;
let scaleTableName: string | null = null;
let scaleUserId: string | null = null; // User ID from scale device info
let scaleMeasurementCount: number = 0; // Total measurement count
let dataCache: { data: RenphoData; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (scale data doesn't change frequently)

// AES-128-ECB encryption for Renpho API
function aesEncrypt(plaintext: string): string {
  const cipher = crypto.createCipheriv("aes-128-ecb", ENCRYPTION_KEY, null);
  cipher.setAutoPadding(true); // PKCS7 padding
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

// AES-128-ECB decryption for Renpho API responses
function aesDecrypt(ciphertext: string): string {
  const decipher = crypto.createDecipheriv("aes-128-ecb", ENCRYPTION_KEY, null);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

// Decrypt response data
function decryptResponse<T>(data: string | T): T {
  if (typeof data === "string") {
    try {
      const decrypted = aesDecrypt(data);
      return JSON.parse(decrypted) as T;
    } catch (e) {
      console.error("[Renpho] Decryption failed:", e);
      return data as T;
    }
  }
  return data;
}

// Encrypt request payload
function encryptRequest(obj: Record<string, unknown>): { encryptData: string } {
  const serialized = JSON.stringify(obj);
  return { encryptData: aesEncrypt(serialized) };
}

// Encrypt empty bytes (used by some endpoints)
function encryptEmptyBytes(): { encryptData: string } {
  const cipher = crypto.createCipheriv("aes-128-ecb", ENCRYPTION_KEY, null);
  cipher.setAutoPadding(true); // PKCS7 padding
  // Encrypt empty buffer - PKCS7 will pad it to 16 bytes of 0x10
  const encrypted = Buffer.concat([cipher.update(Buffer.alloc(0)), cipher.final()]);
  return { encryptData: encrypted.toString("base64") };
}

// Authenticate with Renpho (new API)
async function authenticate(): Promise<boolean> {
  const email = process.env.RENPHO_EMAIL;
  const password = process.env.RENPHO_PASSWORD;

  if (!email || !password) {
    console.error("[Renpho] Missing credentials");
    return false;
  }

  // Check if current token is still valid
  if (authToken && userId && Date.now() < tokenExpiry) {
    return true;
  }

  try {
    console.log("[Renpho] Authenticating with cloud.renpho.com...");

    // Build login payload
    const loginPayload = {
      questionnaire: {},
      login: {
        password,
        areaCode: "AU",
        appRevision: APP_VERSION,
        cellphoneType: "PythonScript",
        systemType: "11",
        email,
        platform: PLATFORM,
      },
      bindingList: {
        deviceTypes: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"],
      },
    };

    // Encrypt and send
    const encryptedPayload = encryptRequest(loginPayload);

    const response = await fetch(`${RENPHO_API}/renpho-aggregation/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `Renpho/${APP_VERSION} (Android)`,
        Accept: "application/json",
        appVersion: APP_VERSION,
        platform: PLATFORM,
      },
      body: JSON.stringify(encryptedPayload),
    });

    const rawData = await response.json();

    if (!SUCCESS_CODES.includes(rawData.code)) {
      console.error("[Renpho] Auth failed:", rawData.msg || rawData.code);
      return false;
    }

    // Decrypt the response data
    interface LoginResponse {
      login?: {
        token?: string;
        id?: number | string;
        userId?: string;
      };
      token?: string;
      userId?: string;
    }
    const loginInfo = decryptResponse<LoginResponse>(rawData.data);

    // Extract token and userId - token is inside login object
    const loginData = loginInfo?.login;
    authToken = loginData?.token || loginInfo?.token;
    userId = String(loginData?.id || loginData?.userId || loginInfo?.userId || "");
    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    if (!authToken) {
      console.error("[Renpho] No token in response");
      return false;
    }

    console.log("[Renpho] Authenticated successfully");
    return true;
  } catch (error) {
    console.error("[Renpho] Auth error:", error);
    return false;
  }
}

// Make authenticated API request (new API)
async function renphoFetch<T>(endpoint: string, body?: Record<string, unknown>): Promise<T | null> {
  const authenticated = await authenticate();
  if (!authenticated || !authToken || !userId) return null;

  try {

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": `Renpho/${APP_VERSION} (Android)`,
      Accept: "application/json",
      appVersion: APP_VERSION,
      platform: PLATFORM,
      token: authToken,
      userId: userId,
    };

    const response = await fetch(`${RENPHO_API}${endpoint}`, {
      method: body ? "POST" : "GET",
      headers,
      ...(body && { body: JSON.stringify(encryptRequest(body)) }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear and retry
        authToken = null;
        userId = null;
        tokenExpiry = 0;
        const retryAuth = await authenticate();
        if (retryAuth) {
          return renphoFetch(endpoint, body);
        }
      }
      console.error(`[Renpho] API error ${response.status}:`, await response.text());
      return null;
    }

    const rawData = await response.json();

    // If response has encrypted data field, decrypt it
    if (rawData.data && typeof rawData.data === "string") {
      const decrypted = decryptResponse<T>(rawData.data);
      return { ...rawData, data: decrypted } as T;
    }

    return rawData as T;
  } catch (error) {
    console.error("[Renpho] API request error:", error);
    return null;
  }
}

// Get device info and table name
async function getDeviceInfo(): Promise<boolean> {
  if (scaleTableName) return true;

  const authenticated = await authenticate();
  if (!authenticated || !authToken || !userId) return false;

  interface DeviceResponse {
    code: number | string;
    msg?: string;
    data?: string | Array<{
      tableName?: string;
      deviceType?: string;
      count?: number;
    }> | {
      scale?: Array<{
        tableName?: string;
        deviceType?: string;
        count?: number;
        userId?: string;
      }>;
    };
  }

  // Try two different body formats like the Python library
  const bodyFormats = [encryptEmptyBytes, () => encryptRequest({})];

  for (const bodyFn of bodyFormats) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": `Renpho/${APP_VERSION} (Android)`,
        Accept: "application/json",
        appVersion: APP_VERSION,
        platform: PLATFORM,
        token: authToken,
        userId: userId,
      };

      const response = await fetch(`${RENPHO_API}/renpho-aggregation/device/count`, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyFn()),
      });

      const rawData: DeviceResponse = await response.json();

      if (!SUCCESS_CODES.includes(rawData.code)) {
        continue;
      }

      // Decrypt if needed
      let deviceData: unknown = rawData.data;
      if (typeof rawData.data === "string") {
        // First get the raw decrypted string before JSON parsing
        const rawDecrypted = aesDecrypt(rawData.data);

        // Extract userIds directly from the raw JSON string to preserve precision
        const userIdMatch = rawDecrypted.match(/"userIds":\s*\[\s*(\d+)/);
        if (userIdMatch) {
          scaleUserId = userIdMatch[1]; // Get the exact string before JSON parsing loses precision
        }

        deviceData = JSON.parse(rawDecrypted);
      }

      // Handle different response structures
      let scales: Array<{ tableName?: string; deviceType?: string; count?: number; userIds?: (number | string)[] }> = [];

      if (Array.isArray(deviceData)) {
        scales = deviceData;
      } else if (deviceData && typeof deviceData === "object") {
        const data = deviceData as { scale?: Array<{ tableName?: string; deviceType?: string; count?: number; userIds?: (number | string)[] }> };
        scales = data.scale || [];
      }

      // Log all available scales for debugging
      console.log("[Renpho] Available scales:", scales.map(s => ({
        tableName: s.tableName,
        deviceType: s.deviceType,
        count: s.count
      })));

      // Filter to scales with measurements
      const validScales = scales.filter((d) => d.tableName && (d.count ?? 0) > 0);

      if (validScales.length === 0) {
        continue;
      }

      // Prefer Morphoscan (device type 14) or pick the one with most recent data (highest count often means most active)
      // Device types: 01=basic scale, 14=Morphoscan (based on Renpho API patterns)
      let scale = validScales.find((d) => d.deviceType === "14");

      // If no Morphoscan found, try to pick the scale with "girth" in table name (body composition)
      // or fall back to the one with the most measurements
      if (!scale) {
        scale = validScales.find((d) => d.tableName?.toLowerCase().includes("girth"));
      }
      if (!scale) {
        // Sort by count descending and pick the one with most measurements
        validScales.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
        scale = validScales[0];
      }

      console.log("[Renpho] Selected scale:", scale);

      if (scale?.tableName) {
        scaleTableName = scale.tableName;
        scaleMeasurementCount = scale.count ?? 0;
        // Only update scaleUserId if not already extracted from raw JSON
        if (!scaleUserId && scale.userIds && scale.userIds.length > 0) {
          scaleUserId = String(scale.userIds[0]);
        }
        return true;
      }
    } catch (error) {
      console.error("[Renpho] Device info attempt error:", error);
      continue;
    }
  }

  return false;
}

// Get latest measurement (new API)
router.get("/latest", async (req: Request, res: Response) => {
  const forceRefresh = req.query.refresh === "true";

  // Check cache (unless force refresh)
  if (!forceRefresh && dataCache && Date.now() - dataCache.timestamp < CACHE_TTL) {
    return res.json(dataCache.data);
  }

  // Clear device cache on force refresh to re-detect scales
  if (forceRefresh) {
    scaleTableName = null;
    scaleUserId = null;
    scaleMeasurementCount = 0;
    dataCache = null;
  }

  if (!process.env.RENPHO_EMAIL || !process.env.RENPHO_PASSWORD) {
    return res.status(503).json({ error: "Renpho not configured" });
  }

  try {
    interface Measurement {
      id?: number | string;
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
      heartRate?: number;
    }

    interface MeasurementResponse {
      code: number | string;
      msg?: string;
      data?: Measurement[] | { list?: Measurement[] };
    }

    // First get device info for table name
    await getDeviceInfo();

    // Request page 1 - Renpho API returns newest measurements first
    const pageSize = 50;

    const measurementParams: Record<string, unknown> = {
      pageNum: 1,
      pageSize: pageSize,
    };

    // Add table name and userIds from device info
    if (scaleTableName) {
      measurementParams.tableName = scaleTableName;
    }

    // Use scaleUserId from device info if available, otherwise fall back to login userId
    const effectiveUserId = scaleUserId || userId;
    if (effectiveUserId) {
      measurementParams.userIds = [effectiveUserId];
    }

    const data = await renphoFetch<MeasurementResponse>(
      "/RenphoHealth/scale/queryAllMeasureDataList",
      measurementParams
    );

    if (!data || !SUCCESS_CODES.includes(data.code)) {
      return res.status(404).json({ error: "No measurement data found" });
    }

    // Handle different response structures - data can be array or object with list
    let measurements: Measurement[] = [];
    if (Array.isArray(data.data)) {
      measurements = data.data;
    } else if (data.data && "list" in data.data) {
      measurements = data.data.list || [];
    }

    if (measurements.length === 0) {
      return res.status(404).json({ error: "No measurement data found" });
    }

    // Sort by timestamp descending to get the most recent
    measurements.sort((a, b) => {
      const timeA = a.timeStamp ?? a.createTime ?? 0;
      const timeB = b.timeStamp ?? b.createTime ?? 0;
      return timeB - timeA;
    });

    const latest = measurements[0];

    // Handle both camelCase and lowercase field names
    const bodyFat = latest.bodyfat ?? latest.bodyFat ?? 0;
    const visFat = latest.visfat ?? latest.visFat ?? 0;
    const bodyAge = latest.bodyage ?? latest.bodyAge ?? 0;
    const subFat = latest.subfat ?? latest.subFat;
    const timestamp = latest.timeStamp ?? latest.createTime;

    const renphoData: RenphoData = {
      weight: latest.weight ? Math.round(latest.weight * 100) / 100 : 0,
      bodyFatPercent: bodyFat ? Math.round(bodyFat * 10) / 10 : 0,
      muscleMass: latest.muscle ? Math.round(latest.muscle * 100) / 100 : 0,
      boneMass: latest.bone ? Math.round(latest.bone * 100) / 100 : 0,
      waterPercent: latest.water ? Math.round(latest.water * 10) / 10 : 0,
      visceralFat: visFat ? Math.round(visFat) : 0,
      bmi: latest.bmi ? Math.round(latest.bmi * 10) / 10 : 0,
      metabolicAge: bodyAge ? Math.round(bodyAge) : 0,
      bmr: latest.bmr ? Math.round(latest.bmr) : 0,
      proteinPercent: latest.protein ? Math.round(latest.protein * 10) / 10 : undefined,
      subcutaneousFatPercent: subFat ? Math.round(subFat * 10) / 10 : undefined,
      timestamp: timestamp
        ? new Date(timestamp * 1000).toISOString() // Unix timestamp in seconds
        : new Date().toISOString(),
    };

    // Update cache
    dataCache = { data: renphoData, timestamp: Date.now() };

    res.json(renphoData);
  } catch (error) {
    console.error("[Renpho] Latest fetch error:", error);
    res.status(500).json({ error: "Failed to fetch measurement data" });
  }
});

// Get weight trend - DB-backed with optional API fallback
router.get("/trend", async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  // Optional: request extended metrics for body composition chart
  const extended = req.query.extended === "true";

  try {
    // Try DB first if we have cached data
    const dbCount = getRenphoCount();
    if (dbCount > 0) {
      let dbData: RenphoData[];
      let isAllData = false;

      if (startDate && endDate) {
        dbData = getRenphoForDateRange(startDate, endDate);
      } else {
        dbData = getDbHistory(days);
      }

      // If no data in requested range, fall back to all available data
      if (dbData.length === 0) {
        dbData = getAllRenphoHistory();
        isAllData = true;
      }

      if (dbData.length > 0) {
        // Build trend data with optional extended metrics
        const trend = dbData.map((d) => {
          const base: RenphoTrend = {
            date: d.timestamp.split("T")[0],
            weight: d.weight,
            bodyFatPercent: d.bodyFatPercent,
          };

          if (extended) {
            return {
              ...base,
              muscleMass: d.muscleMass,
              boneMass: d.boneMass,
              waterPercent: d.waterPercent,
              visceralFat: d.visceralFat,
              bmi: d.bmi,
            } as RenphoTrendExtended;
          }

          return base;
        });

        // Calculate summary - find first and last with valid data
        let weightChange = 0;
        let bodyFatChange = 0;
        if (trend.length >= 2) {
          const first = trend[0];
          const last = trend[trend.length - 1];
          weightChange = Math.round((last.weight - first.weight) * 100) / 100;

          // Find first and last entries with valid body fat data
          const firstWithBodyFat = trend.find((t) => t.bodyFatPercent > 0);
          const lastWithBodyFat = [...trend].reverse().find((t) => t.bodyFatPercent > 0);
          if (firstWithBodyFat && lastWithBodyFat && firstWithBodyFat !== lastWithBodyFat) {
            bodyFatChange = Math.round((lastWithBodyFat.bodyFatPercent - firstWithBodyFat.bodyFatPercent) * 10) / 10;
          }
        }

        return res.json({
          trend,
          summary: {
            startWeight: trend[0]?.weight ?? 0,
            currentWeight: trend[trend.length - 1]?.weight ?? 0,
            weightChange,
            bodyFatChange,
            measurementCount: trend.length,
            dateRange: {
              first: trend[0]?.date,
              last: trend[trend.length - 1]?.date,
            },
          },
          source: isAllData ? "database_all" : "database",
        });
      }
    }

    // Fallback to API if DB empty
    if (!process.env.RENPHO_EMAIL || !process.env.RENPHO_PASSWORD) {
      return res.json({ trend: [], summary: null, source: "none" });
    }

    interface TrendMeasurement {
      timeStamp?: number;
      createTime?: number;
      weight?: number;
      bodyfat?: number;
      bodyFat?: number;
      muscle?: number;
      bone?: number;
      water?: number;
      visfat?: number;
      visFat?: number;
      bmi?: number;
    }

    interface MeasurementResponse {
      code: number | string;
      data?: TrendMeasurement[] | { list?: TrendMeasurement[] };
    }

    // First get device info for table name
    await getDeviceInfo();

    // Request page 1 - Renpho API returns newest measurements first
    const pageSize = 100;

    const measurementParams: Record<string, unknown> = {
      pageNum: 1,
      pageSize: pageSize,
    };
    if (scaleTableName) {
      measurementParams.tableName = scaleTableName;
    }
    const effectiveUserId = scaleUserId || userId;
    if (effectiveUserId) {
      measurementParams.userIds = [effectiveUserId];
    }

    const data = await renphoFetch<MeasurementResponse>(
      "/RenphoHealth/scale/queryAllMeasureDataList",
      measurementParams
    );

    if (!data || !SUCCESS_CODES.includes(data.code)) {
      return res.json({ trend: [], summary: null, source: "api" });
    }

    let measurements: TrendMeasurement[] = [];
    if (Array.isArray(data.data)) {
      measurements = data.data;
    } else if (data.data && "list" in data.data) {
      measurements = data.data.list || [];
    }

    const trend = measurements
      .filter((m) => (m.timeStamp || m.createTime) && m.weight)
      .map((m) => {
        const timestamp = m.timeStamp ?? m.createTime ?? 0;
        const bodyFat = m.bodyfat ?? m.bodyFat ?? 0;
        const base: RenphoTrend = {
          date: new Date(timestamp * 1000).toISOString().split("T")[0],
          weight: Math.round((m.weight || 0) * 100) / 100,
          bodyFatPercent: Math.round(bodyFat * 10) / 10,
        };

        if (extended) {
          const visFat = m.visfat ?? m.visFat ?? 0;
          return {
            ...base,
            muscleMass: m.muscle ? Math.round(m.muscle * 100) / 100 : undefined,
            boneMass: m.bone ? Math.round(m.bone * 100) / 100 : undefined,
            waterPercent: m.water ? Math.round(m.water * 10) / 10 : undefined,
            visceralFat: visFat ? Math.round(visFat) : undefined,
            bmi: m.bmi ? Math.round(m.bmi * 10) / 10 : undefined,
          } as RenphoTrendExtended;
        }

        return base;
      });

    // Sort by date ascending
    trend.sort((a, b) => a.date.localeCompare(b.date));

    // Filter to requested days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filteredTrend = trend.filter((t) => new Date(t.date) >= cutoffDate);

    // Calculate change
    let weightChange = 0;
    let bodyFatChange = 0;
    if (filteredTrend.length >= 2) {
      const first = filteredTrend[0];
      const last = filteredTrend[filteredTrend.length - 1];
      weightChange = Math.round((last.weight - first.weight) * 100) / 100;

      // Find first and last entries with valid body fat data
      const firstWithBodyFat = filteredTrend.find((t) => t.bodyFatPercent > 0);
      const lastWithBodyFat = [...filteredTrend].reverse().find((t) => t.bodyFatPercent > 0);
      if (firstWithBodyFat && lastWithBodyFat && firstWithBodyFat !== lastWithBodyFat) {
        bodyFatChange = Math.round((lastWithBodyFat.bodyFatPercent - firstWithBodyFat.bodyFatPercent) * 10) / 10;
      }
    }

    res.json({
      trend: filteredTrend,
      summary: {
        startWeight: filteredTrend[0]?.weight ?? 0,
        currentWeight: filteredTrend[filteredTrend.length - 1]?.weight ?? 0,
        weightChange,
        bodyFatChange,
        measurementCount: filteredTrend.length,
      },
      source: "api",
    });
  } catch (error) {
    console.error("[Renpho] Trend fetch error:", error);
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
});

// Get user goals (new API - goals may be in user profile)
router.get("/goals", async (_req: Request, res: Response) => {
  if (!process.env.RENPHO_EMAIL || !process.env.RENPHO_PASSWORD) {
    return res.status(503).json({ error: "Renpho not configured" });
  }

  try {
    // The new API may not have a dedicated goals endpoint
    // Return placeholder for now - goals are typically set in the app
    res.json({
      weightGoal: null,
      bodyFatGoal: null,
      note: "Goals can be viewed and set in the Renpho mobile app",
    });
  } catch (error) {
    console.error("[Renpho] Goals fetch error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// Connection status
router.get("/connection", async (_req: Request, res: Response) => {
  const hasCredentials = !!(
    process.env.RENPHO_EMAIL &&
    process.env.RENPHO_PASSWORD
  );

  if (!hasCredentials) {
    return res.json({ connected: false });
  }

  const authenticated = await authenticate();
  res.json({ connected: authenticated });
});

// Debug endpoint to see all available devices and data
router.get("/debug", async (_req: Request, res: Response) => {
  if (!process.env.RENPHO_EMAIL || !process.env.RENPHO_PASSWORD) {
    return res.status(503).json({ error: "Renpho not configured" });
  }

  const authenticated = await authenticate();
  if (!authenticated || !authToken || !userId) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": `Renpho/${APP_VERSION} (Android)`,
      Accept: "application/json",
      appVersion: APP_VERSION,
      platform: PLATFORM,
      token: authToken,
      userId: userId,
    };

    // Get device count/info
    const deviceResponse = await fetch(`${RENPHO_API}/renpho-aggregation/device/count`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptEmptyBytes()),
    });
    const deviceRaw = await deviceResponse.json();

    let deviceData: unknown = deviceRaw.data;
    if (typeof deviceRaw.data === "string") {
      deviceData = JSON.parse(aesDecrypt(deviceRaw.data));
    }

    // Try to get measurements from each scale if available
    const scales = Array.isArray(deviceData)
      ? deviceData
      : (deviceData as { scale?: unknown[] })?.scale || [];

    const measurementSamples: Record<string, unknown> = {};

    for (const scale of scales.slice(0, 5)) { // Limit to first 5 scales
      const scaleInfo = scale as { tableName?: string; deviceType?: string; count?: number; userIds?: (number | string)[] };
      if (scaleInfo.tableName && scaleInfo.count && scaleInfo.count > 0) {
        try {
          const measurementParams = {
            pageNum: 1,
            pageSize: 3, // Just get a few samples
            tableName: scaleInfo.tableName,
            userIds: scaleInfo.userIds || [],
          };

          const measurementResponse = await fetch(
            `${RENPHO_API}/RenphoHealth/scale/queryAllMeasureDataList`,
            {
              method: "POST",
              headers,
              body: JSON.stringify(encryptRequest(measurementParams)),
            }
          );
          const measurementRaw = await measurementResponse.json();

          let measurementData: unknown = measurementRaw.data;
          if (typeof measurementRaw.data === "string") {
            measurementData = JSON.parse(aesDecrypt(measurementRaw.data));
          }

          measurementSamples[scaleInfo.tableName] = {
            deviceType: scaleInfo.deviceType,
            count: scaleInfo.count,
            userIds: scaleInfo.userIds,
            sampleData: measurementData,
          };
        } catch (e) {
          measurementSamples[scaleInfo.tableName] = { error: String(e) };
        }
      }
    }

    res.json({
      userId,
      authToken: authToken ? "***" + authToken.slice(-10) : null,
      deviceInfo: deviceData,
      selectedScale: {
        tableName: scaleTableName,
        userId: scaleUserId,
        count: scaleMeasurementCount,
      },
      measurementSamples,
    });
  } catch (error) {
    console.error("[Renpho] Debug error:", error);
    res.status(500).json({ error: "Debug failed", details: String(error) });
  }
});

export default router;
