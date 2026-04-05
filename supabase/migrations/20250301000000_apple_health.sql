-- Apple Health Daily Metrics Table
CREATE TABLE IF NOT EXISTS apple_health_daily_metrics (
  date DATE PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apple Health Workouts Table
CREATE TABLE IF NOT EXISTS apple_health_workouts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes REAL NOT NULL,
  calories REAL DEFAULT 0,
  distance_km REAL,
  avg_heart_rate REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, start_time, type)
);

-- Index for faster workout queries
CREATE INDEX IF NOT EXISTS idx_apple_health_workouts_date ON apple_health_workouts(date);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE apple_health_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE apple_health_workouts ENABLE ROW LEVEL SECURITY;

-- Policy for service key access (allows all operations)
CREATE POLICY "Allow service key access" ON apple_health_daily_metrics
  FOR ALL USING (true);

CREATE POLICY "Allow service key access" ON apple_health_workouts
  FOR ALL USING (true);
