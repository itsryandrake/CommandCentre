import Database from "better-sqlite3";
import path from "path";
import type { AppleHealthData, AppleHealthWorkout } from "../../shared/types/health.ts";

// Database file path (in server directory)
const DB_PATH = path.join(process.cwd(), "server", "db", "apple_health.db");

// Initialize database
const db = new Database(DB_PATH);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_metrics (
    date TEXT PRIMARY KEY,
    steps INTEGER DEFAULT 0,
    active_calories REAL DEFAULT 0,
    resting_calories REAL DEFAULT 0,
    total_calories REAL DEFAULT 0,
    resting_heart_rate REAL DEFAULT 0,
    walking_heart_rate_avg REAL,
    sleep_hours REAL DEFAULT 0,
    stand_hours INTEGER DEFAULT 0,
    exercise_minutes INTEGER DEFAULT 0,
    distance_km REAL DEFAULT 0,
    flights_climbed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes REAL NOT NULL,
    calories REAL DEFAULT 0,
    distance_km REAL,
    avg_heart_rate REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, start_time, type)
  );

  CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
`);

// Upsert daily metrics
export function upsertDailyMetrics(data: AppleHealthData): void {
  const stmt = db.prepare(`
    INSERT INTO daily_metrics (
      date, steps, active_calories, resting_calories, total_calories,
      resting_heart_rate, walking_heart_rate_avg, sleep_hours, stand_hours,
      exercise_minutes, distance_km, flights_climbed, updated_at
    ) VALUES (
      @date, @steps, @activeCalories, @restingCalories, @totalCalories,
      @restingHeartRate, @walkingHeartRateAvg, @sleepHours, @standHours,
      @exerciseMinutes, @distanceKm, @flightsClimbed, datetime('now')
    )
    ON CONFLICT(date) DO UPDATE SET
      steps = @steps,
      active_calories = @activeCalories,
      resting_calories = @restingCalories,
      total_calories = @totalCalories,
      resting_heart_rate = @restingHeartRate,
      walking_heart_rate_avg = @walkingHeartRateAvg,
      sleep_hours = @sleepHours,
      stand_hours = @standHours,
      exercise_minutes = @exerciseMinutes,
      distance_km = @distanceKm,
      flights_climbed = @flightsClimbed,
      updated_at = datetime('now')
  `);

  stmt.run({
    date: data.date,
    steps: data.steps,
    activeCalories: data.activeCalories,
    restingCalories: data.restingCalories,
    totalCalories: data.totalCalories,
    restingHeartRate: data.restingHeartRate,
    walkingHeartRateAvg: data.walkingHeartRateAvg ?? null,
    sleepHours: data.sleepHours,
    standHours: data.standHours,
    exerciseMinutes: data.exerciseMinutes,
    distanceKm: data.distanceKm,
    flightsClimbed: data.flightsClimbed,
  });
}

// Insert workout (ignore duplicates)
export function insertWorkout(workout: AppleHealthWorkout): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO workouts (
      date, type, start_time, end_time, duration_minutes,
      calories, distance_km, avg_heart_rate
    ) VALUES (
      @date, @type, @startTime, @endTime, @duration,
      @calories, @distance, @avgHeartRate
    )
  `);

  stmt.run({
    date: workout.startTime.split("T")[0],
    type: workout.type,
    startTime: workout.startTime,
    endTime: workout.endTime,
    duration: workout.duration,
    calories: workout.calories,
    distance: workout.distance ?? null,
    avgHeartRate: workout.avgHeartRate ?? null,
  });
}

// Get latest daily metrics
export function getLatestMetrics(): AppleHealthData | null {
  const stmt = db.prepare(`
    SELECT * FROM daily_metrics
    ORDER BY date DESC
    LIMIT 1
  `);

  const row = stmt.get() as {
    date: string;
    steps: number;
    active_calories: number;
    resting_calories: number;
    total_calories: number;
    resting_heart_rate: number;
    walking_heart_rate_avg: number | null;
    sleep_hours: number;
    stand_hours: number;
    exercise_minutes: number;
    distance_km: number;
    flights_climbed: number;
  } | undefined;

  if (!row) return null;

  return {
    date: row.date,
    steps: row.steps,
    activeCalories: row.active_calories,
    restingCalories: row.resting_calories,
    totalCalories: row.total_calories,
    restingHeartRate: row.resting_heart_rate,
    walkingHeartRateAvg: row.walking_heart_rate_avg ?? undefined,
    sleepHours: row.sleep_hours,
    standHours: row.stand_hours,
    exerciseMinutes: row.exercise_minutes,
    distanceKm: row.distance_km,
    flightsClimbed: row.flights_climbed,
  };
}

// Get metrics for a specific date
export function getMetricsForDate(date: string): AppleHealthData | null {
  const stmt = db.prepare(`
    SELECT * FROM daily_metrics
    WHERE date = ?
  `);

  const row = stmt.get(date) as {
    date: string;
    steps: number;
    active_calories: number;
    resting_calories: number;
    total_calories: number;
    resting_heart_rate: number;
    walking_heart_rate_avg: number | null;
    sleep_hours: number;
    stand_hours: number;
    exercise_minutes: number;
    distance_km: number;
    flights_climbed: number;
  } | undefined;

  if (!row) return null;

  return {
    date: row.date,
    steps: row.steps,
    activeCalories: row.active_calories,
    restingCalories: row.resting_calories,
    totalCalories: row.total_calories,
    restingHeartRate: row.resting_heart_rate,
    walkingHeartRateAvg: row.walking_heart_rate_avg ?? undefined,
    sleepHours: row.sleep_hours,
    standHours: row.stand_hours,
    exerciseMinutes: row.exercise_minutes,
    distanceKm: row.distance_km,
    flightsClimbed: row.flights_climbed,
  };
}

// Get historical metrics
export function getMetricsHistory(days: number): AppleHealthData[] {
  const stmt = db.prepare(`
    SELECT * FROM daily_metrics
    ORDER BY date DESC
    LIMIT ?
  `);

  const rows = stmt.all(days) as Array<{
    date: string;
    steps: number;
    active_calories: number;
    resting_calories: number;
    total_calories: number;
    resting_heart_rate: number;
    walking_heart_rate_avg: number | null;
    sleep_hours: number;
    stand_hours: number;
    exercise_minutes: number;
    distance_km: number;
    flights_climbed: number;
  }>;

  return rows.map((row) => ({
    date: row.date,
    steps: row.steps,
    activeCalories: row.active_calories,
    restingCalories: row.resting_calories,
    totalCalories: row.total_calories,
    restingHeartRate: row.resting_heart_rate,
    walkingHeartRateAvg: row.walking_heart_rate_avg ?? undefined,
    sleepHours: row.sleep_hours,
    standHours: row.stand_hours,
    exerciseMinutes: row.exercise_minutes,
    distanceKm: row.distance_km,
    flightsClimbed: row.flights_climbed,
  }));
}

// Get workouts for a date range
export function getWorkouts(startDate: string, endDate: string): AppleHealthWorkout[] {
  const stmt = db.prepare(`
    SELECT * FROM workouts
    WHERE date >= ? AND date <= ?
    ORDER BY start_time DESC
  `);

  const rows = stmt.all(startDate, endDate) as Array<{
    type: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    calories: number;
    distance_km: number | null;
    avg_heart_rate: number | null;
  }>;

  return rows.map((row) => ({
    type: row.type,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration_minutes,
    calories: row.calories,
    distance: row.distance_km ?? undefined,
    avgHeartRate: row.avg_heart_rate ?? undefined,
  }));
}

// Get recent workouts
export function getRecentWorkouts(limit: number = 10): AppleHealthWorkout[] {
  const stmt = db.prepare(`
    SELECT * FROM workouts
    ORDER BY start_time DESC
    LIMIT ?
  `);

  const rows = stmt.all(limit) as Array<{
    type: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    calories: number;
    distance_km: number | null;
    avg_heart_rate: number | null;
  }>;

  return rows.map((row) => ({
    type: row.type,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration_minutes,
    calories: row.calories,
    distance: row.distance_km ?? undefined,
    avgHeartRate: row.avg_heart_rate ?? undefined,
  }));
}
