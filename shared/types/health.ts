// Whoop recovery and strain data
export interface WhoopRecovery {
  score: number;              // 0-100 recovery score
  hrvMs: number;              // Heart rate variability in milliseconds
  restingHeartRate: number;   // Resting heart rate in BPM
  sleepScore: number;         // 0-100 sleep performance score
  strain: number;             // 0-21 strain scale
  respiratoryRate: number;    // Breaths per minute
  skinTempCelsius?: number;   // Skin temperature (4.0 members)
  spo2Percent?: number;       // Blood oxygen (4.0 members)
  date: string;               // ISO date string
}

export interface WhoopSleepData {
  qualityDuration: number;    // Minutes of quality sleep
  totalDuration: number;      // Total time in bed (minutes)
  remDuration: number;        // REM sleep minutes
  deepDuration: number;       // Deep/SWS sleep minutes
  lightDuration: number;      // Light sleep minutes
  awakeDuration: number;      // Time awake minutes
  sleepEfficiency: number;    // Percentage (0-100)
  date: string;
}

// Eight Sleep smart mattress data
export interface EightSleepData {
  sleepScore: number;         // 0-100 sleep fitness score
  bedTemperature: number;     // Current bed temperature (Celsius)
  roomTemperature: number;    // Room temperature (Celsius)
  timeInBed: number;          // Minutes
  sleepDuration: number;      // Actual sleep time (minutes)
  awakeTime: number;          // Time awake in bed (minutes)
  tossTurnCount: number;      // Movement count
  hrvAvg: number;             // Average HRV during sleep
  respiratoryRate: number;    // Average breaths per minute
  heartRate: number;          // Average heart rate during sleep
  date: string;
}

export interface EightSleepDeviceStatus {
  leftSide: {
    currentTemp: number;
    targetTemp: number;
    isOn: boolean;
  };
  rightSide: {
    currentTemp: number;
    targetTemp: number;
    isOn: boolean;
  };
  priming: boolean;
}

// Renpho smart scale body composition data
export interface RenphoData {
  weight: number;             // kg
  bodyFatPercent: number;
  muscleMass: number;         // kg
  boneMass: number;           // kg
  waterPercent: number;
  visceralFat: number;        // 1-59 scale
  bmi: number;
  metabolicAge: number;       // Years
  bmr: number;                // Basal metabolic rate (kcal)
  proteinPercent?: number;
  skeletalMusclePercent?: number;
  subcutaneousFatPercent?: number;
  timestamp: string;          // ISO timestamp
}

export interface RenphoTrend {
  date: string;
  weight: number;
  bodyFatPercent: number;
}

// Extended trend data for body composition charts
export interface RenphoTrendExtended {
  date: string;
  weight: number;
  bodyFatPercent: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercent?: number;
  visceralFat?: number;
  bmi?: number;
}

// Metrics that can be toggled on body composition chart
export type BodyCompositionMetric =
  | "weight"
  | "bodyFatPercent"
  | "muscleMass"
  | "waterPercent"
  | "boneMass"
  | "visceralFat"
  | "bmi";

// Date filter for health charts
export interface HealthDateFilter {
  type: "days" | "range";
  days?: number; // 7, 30, 90
  startDate?: string;
  endDate?: string;
}

// Chart data point for sleep scores
export interface SleepScoreDataPoint {
  date: string;
  sleepScore: number;
  hrvAvg?: number;
  sleepDuration?: number;
}

// Chart data point for weight
export interface WeightDataPoint {
  date: string;
  weight: number;
  change?: number;
}

// Apple Health data (received via webhook from Health Auto Export app)
export interface AppleHealthData {
  steps: number;              // Daily steps
  activeCalories: number;     // Active energy burned (kcal)
  restingCalories: number;    // Resting energy burned (kcal)
  totalCalories: number;      // Total calories
  restingHeartRate: number;   // BPM
  walkingHeartRateAvg?: number;
  sleepHours: number;         // Total sleep hours
  standHours: number;         // Hours standing
  exerciseMinutes: number;    // Exercise minutes
  distanceKm: number;         // Walking/running distance
  flightsClimbed: number;
  date: string;
  // Body composition (from Renpho via Apple Health sync)
  weightKg?: number;
  bmi?: number;
  bodyFatPercent?: number;
  leanBodyMassKg?: number;
}

export interface AppleHealthWorkout {
  type: string;               // e.g. "Running", "Cycling", "Strength Training"
  startTime: string;
  endTime: string;
  duration: number;           // Minutes
  calories: number;
  distance?: number;          // km
  avgHeartRate?: number;
}

// Unified health summary for dashboard
export interface HealthSummary {
  whoop: WhoopRecovery | null;
  whoopSleep: WhoopSleepData | null;
  eightSleep: EightSleepData | null;
  renpho: RenphoData | null;
  appleHealth: AppleHealthData | null;
  lastUpdated: string;
}

// Recovery score colour indicator
export type RecoveryLevel = "red" | "yellow" | "green";

export function getRecoveryLevel(score: number): RecoveryLevel {
  if (score >= 67) return "green";
  if (score >= 34) return "yellow";
  return "red";
}

// Weight trend indicator
export type WeightTrend = "up" | "down" | "stable";

export function getWeightTrend(current: number, previous: number): WeightTrend {
  const diff = current - previous;
  if (Math.abs(diff) < 0.2) return "stable";
  return diff > 0 ? "up" : "down";
}

// Strain level description
export function getStrainDescription(strain: number): string {
  if (strain >= 18) return "All Out";
  if (strain >= 14) return "Strenuous";
  if (strain >= 10) return "Moderate";
  if (strain >= 5) return "Light";
  return "Recovery";
}
