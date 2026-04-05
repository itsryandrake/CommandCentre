import { getSupabase } from "./supabase.ts";
import type { AppleHealthData, AppleHealthWorkout } from "../../shared/types/health.ts";

// Upsert daily metrics
export async function upsertDailyMetrics(data: AppleHealthData): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("apple_health_daily_metrics")
    .upsert({
      date: data.date,
      steps: data.steps,
      active_calories: data.activeCalories,
      resting_calories: data.restingCalories,
      total_calories: data.totalCalories,
      resting_heart_rate: data.restingHeartRate,
      walking_heart_rate_avg: data.walkingHeartRateAvg ?? null,
      sleep_hours: data.sleepHours,
      stand_hours: data.standHours,
      exercise_minutes: data.exerciseMinutes,
      distance_km: data.distanceKm,
      flights_climbed: data.flightsClimbed,
      updated_at: new Date().toISOString(),
    }, { onConflict: "date" });

  if (error) {
    console.error("[AppleHealth Supabase] Upsert error:", error);
    throw error;
  }
}

// Insert workout (ignore duplicates)
export async function insertWorkout(workout: AppleHealthWorkout): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("apple_health_workouts")
    .upsert({
      date: workout.startTime.split("T")[0],
      type: workout.type,
      start_time: workout.startTime,
      end_time: workout.endTime,
      duration_minutes: workout.duration,
      calories: workout.calories,
      distance_km: workout.distance ?? null,
      avg_heart_rate: workout.avgHeartRate ?? null,
    }, { onConflict: "date,start_time,type" });

  if (error && error.code !== "23505") { // Ignore unique constraint violations
    console.error("[AppleHealth Supabase] Insert workout error:", error);
    throw error;
  }
}

// Get latest daily metrics
export async function getLatestMetrics(): Promise<AppleHealthData | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("apple_health_daily_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows
    console.error("[AppleHealth Supabase] Get latest error:", error);
    return null;
  }

  return mapRowToHealthData(data);
}

// Get metrics for a specific date
export async function getMetricsForDate(date: string): Promise<AppleHealthData | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("apple_health_daily_metrics")
    .select("*")
    .eq("date", date)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows
    console.error("[AppleHealth Supabase] Get by date error:", error);
    return null;
  }

  return mapRowToHealthData(data);
}

// Get historical metrics
export async function getMetricsHistory(days: number): Promise<AppleHealthData[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("apple_health_daily_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(days);

  if (error) {
    console.error("[AppleHealth Supabase] Get history error:", error);
    return [];
  }

  return data.map(mapRowToHealthData);
}

// Get workouts for a date range
export async function getWorkouts(startDate: string, endDate: string): Promise<AppleHealthWorkout[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("apple_health_workouts")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("start_time", { ascending: false });

  if (error) {
    console.error("[AppleHealth Supabase] Get workouts error:", error);
    return [];
  }

  return data.map(mapRowToWorkout);
}

// Get recent workouts
export async function getRecentWorkouts(limit: number = 10): Promise<AppleHealthWorkout[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("apple_health_workouts")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[AppleHealth Supabase] Get recent workouts error:", error);
    return [];
  }

  return data.map(mapRowToWorkout);
}

// Map database row to AppleHealthData
function mapRowToHealthData(row: Record<string, unknown>): AppleHealthData {
  return {
    date: row.date as string,
    steps: row.steps as number,
    activeCalories: row.active_calories as number,
    restingCalories: row.resting_calories as number,
    totalCalories: row.total_calories as number,
    restingHeartRate: row.resting_heart_rate as number,
    walkingHeartRateAvg: (row.walking_heart_rate_avg as number | null) ?? undefined,
    sleepHours: row.sleep_hours as number,
    standHours: row.stand_hours as number,
    exerciseMinutes: row.exercise_minutes as number,
    distanceKm: row.distance_km as number,
    flightsClimbed: row.flights_climbed as number,
  };
}

// Map database row to AppleHealthWorkout
function mapRowToWorkout(row: Record<string, unknown>): AppleHealthWorkout {
  return {
    type: row.type as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    duration: row.duration_minutes as number,
    calories: row.calories as number,
    distance: (row.distance_km as number | null) ?? undefined,
    avgHeartRate: (row.avg_heart_rate as number | null) ?? undefined,
  };
}
