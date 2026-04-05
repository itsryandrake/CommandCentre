import db from "./index.ts";
import type { EightSleepData, RenphoData } from "../../shared/types/health.ts";

// ============================================================================
// Eight Sleep Data Access
// ============================================================================

export interface CachedEightSleepRow {
  id: number;
  date: string;
  sleep_score: number | null;
  bed_temperature: number | null;
  room_temperature: number | null;
  time_in_bed: number | null;
  sleep_duration: number | null;
  awake_time: number | null;
  toss_turn_count: number | null;
  hrv_avg: number | null;
  respiratory_rate: number | null;
  heart_rate: number | null;
  raw_data: string | null;
  synced_at: string;
}

export function upsertEightSleepData(data: EightSleepData): void {
  const stmt = db.prepare(`
    INSERT INTO cached_eight_sleep (
      date, sleep_score, bed_temperature, room_temperature,
      time_in_bed, sleep_duration, awake_time, toss_turn_count,
      hrv_avg, respiratory_rate, heart_rate, raw_data, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      sleep_score = excluded.sleep_score,
      bed_temperature = excluded.bed_temperature,
      room_temperature = excluded.room_temperature,
      time_in_bed = excluded.time_in_bed,
      sleep_duration = excluded.sleep_duration,
      awake_time = excluded.awake_time,
      toss_turn_count = excluded.toss_turn_count,
      hrv_avg = excluded.hrv_avg,
      respiratory_rate = excluded.respiratory_rate,
      heart_rate = excluded.heart_rate,
      raw_data = excluded.raw_data,
      synced_at = excluded.synced_at
  `);

  stmt.run(
    data.date,
    data.sleepScore,
    data.bedTemperature,
    data.roomTemperature,
    data.timeInBed,
    data.sleepDuration,
    data.awakeTime,
    data.tossTurnCount,
    data.hrvAvg,
    data.respiratoryRate,
    data.heartRate,
    JSON.stringify(data),
    new Date().toISOString()
  );
}

export function getEightSleepHistory(days: number): EightSleepData[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  const rows = db.prepare(`
    SELECT * FROM cached_eight_sleep
    WHERE date >= ?
    ORDER BY date ASC
  `).all(cutoffStr) as CachedEightSleepRow[];

  return rows.map(rowToEightSleepData);
}

export function getEightSleepForDateRange(startDate: string, endDate: string): EightSleepData[] {
  const rows = db.prepare(`
    SELECT * FROM cached_eight_sleep
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `).all(startDate, endDate) as CachedEightSleepRow[];

  return rows.map(rowToEightSleepData);
}

export function getEightSleepByDate(date: string): EightSleepData | null {
  const row = db.prepare(`
    SELECT * FROM cached_eight_sleep WHERE date = ?
  `).get(date) as CachedEightSleepRow | undefined;

  return row ? rowToEightSleepData(row) : null;
}

export function getEightSleepCount(): number {
  const result = db.prepare("SELECT COUNT(*) as count FROM cached_eight_sleep").get() as { count: number };
  return result.count;
}

function rowToEightSleepData(row: CachedEightSleepRow): EightSleepData {
  return {
    date: row.date,
    sleepScore: row.sleep_score ?? 0,
    bedTemperature: row.bed_temperature ?? 0,
    roomTemperature: row.room_temperature ?? 0,
    timeInBed: row.time_in_bed ?? 0,
    sleepDuration: row.sleep_duration ?? 0,
    awakeTime: row.awake_time ?? 0,
    tossTurnCount: row.toss_turn_count ?? 0,
    hrvAvg: row.hrv_avg ?? 0,
    respiratoryRate: row.respiratory_rate ?? 0,
    heartRate: row.heart_rate ?? 0,
  };
}

// ============================================================================
// Renpho Data Access
// ============================================================================

export interface CachedRenphoRow {
  id: number;
  date: string;
  timestamp: string;
  weight: number;
  body_fat_percent: number | null;
  muscle_mass: number | null;
  bone_mass: number | null;
  water_percent: number | null;
  visceral_fat: number | null;
  bmi: number | null;
  metabolic_age: number | null;
  bmr: number | null;
  protein_percent: number | null;
  subcutaneous_fat_percent: number | null;
  raw_data: string | null;
  synced_at: string;
}

export function upsertRenphoData(data: RenphoData): void {
  const date = data.timestamp.split("T")[0];

  const stmt = db.prepare(`
    INSERT INTO cached_renpho (
      date, timestamp, weight, body_fat_percent, muscle_mass,
      bone_mass, water_percent, visceral_fat, bmi, metabolic_age,
      bmr, protein_percent, subcutaneous_fat_percent, raw_data, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(timestamp) DO UPDATE SET
      date = excluded.date,
      weight = excluded.weight,
      body_fat_percent = excluded.body_fat_percent,
      muscle_mass = excluded.muscle_mass,
      bone_mass = excluded.bone_mass,
      water_percent = excluded.water_percent,
      visceral_fat = excluded.visceral_fat,
      bmi = excluded.bmi,
      metabolic_age = excluded.metabolic_age,
      bmr = excluded.bmr,
      protein_percent = excluded.protein_percent,
      subcutaneous_fat_percent = excluded.subcutaneous_fat_percent,
      raw_data = excluded.raw_data,
      synced_at = excluded.synced_at
  `);

  stmt.run(
    date,
    data.timestamp,
    data.weight,
    data.bodyFatPercent,
    data.muscleMass,
    data.boneMass,
    data.waterPercent,
    data.visceralFat,
    data.bmi,
    data.metabolicAge,
    data.bmr,
    data.proteinPercent ?? null,
    data.subcutaneousFatPercent ?? null,
    JSON.stringify(data),
    new Date().toISOString()
  );
}

export function getRenphoHistory(days: number): RenphoData[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  const rows = db.prepare(`
    SELECT * FROM cached_renpho
    WHERE date >= ?
    ORDER BY timestamp ASC
  `).all(cutoffStr) as CachedRenphoRow[];

  return rows.map(rowToRenphoData);
}

export function getAllRenphoHistory(): RenphoData[] {
  const rows = db.prepare(`
    SELECT * FROM cached_renpho
    ORDER BY timestamp ASC
  `).all() as CachedRenphoRow[];

  return rows.map(rowToRenphoData);
}

export function getRenphoForDateRange(startDate: string, endDate: string): RenphoData[] {
  const rows = db.prepare(`
    SELECT * FROM cached_renpho
    WHERE date >= ? AND date <= ?
    ORDER BY timestamp ASC
  `).all(startDate, endDate) as CachedRenphoRow[];

  return rows.map(rowToRenphoData);
}

export function getRenphoLatest(): RenphoData | null {
  const row = db.prepare(`
    SELECT * FROM cached_renpho
    ORDER BY timestamp DESC
    LIMIT 1
  `).get() as CachedRenphoRow | undefined;

  return row ? rowToRenphoData(row) : null;
}

export function getRenphoCount(): number {
  const result = db.prepare("SELECT COUNT(*) as count FROM cached_renpho").get() as { count: number };
  return result.count;
}

function rowToRenphoData(row: CachedRenphoRow): RenphoData {
  return {
    weight: row.weight,
    bodyFatPercent: row.body_fat_percent ?? 0,
    muscleMass: row.muscle_mass ?? 0,
    boneMass: row.bone_mass ?? 0,
    waterPercent: row.water_percent ?? 0,
    visceralFat: row.visceral_fat ?? 0,
    bmi: row.bmi ?? 0,
    metabolicAge: row.metabolic_age ?? 0,
    bmr: row.bmr ?? 0,
    proteinPercent: row.protein_percent ?? undefined,
    subcutaneousFatPercent: row.subcutaneous_fat_percent ?? undefined,
    timestamp: row.timestamp,
  };
}

// ============================================================================
// Sync Log Functions
// ============================================================================

export function logHealthSyncStart(syncType: string): number {
  const result = db.prepare(
    "INSERT INTO health_sync_log (sync_type, status, started_at) VALUES (?, ?, ?)"
  ).run(syncType, "in_progress", new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function logHealthSyncComplete(logId: number, recordsCount: number): void {
  db.prepare(
    "UPDATE health_sync_log SET status = ?, records_count = ?, completed_at = ? WHERE id = ?"
  ).run("success", recordsCount, new Date().toISOString(), logId);
}

export function logHealthSyncError(logId: number, errorMessage: string): void {
  db.prepare(
    "UPDATE health_sync_log SET status = ?, error_message = ?, completed_at = ? WHERE id = ?"
  ).run("failed", errorMessage, new Date().toISOString(), logId);
}

export function getLastHealthSyncTime(syncType: string): string | null {
  const result = db.prepare(
    "SELECT completed_at FROM health_sync_log WHERE sync_type = ? AND status = ? ORDER BY id DESC LIMIT 1"
  ).get(syncType, "success") as { completed_at: string } | undefined;
  return result?.completed_at || null;
}
