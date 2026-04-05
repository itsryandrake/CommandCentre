-- Eight Sleep historical data
CREATE TABLE IF NOT EXISTS cached_eight_sleep (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  sleep_score INTEGER,
  bed_temperature REAL,
  room_temperature REAL,
  time_in_bed INTEGER,
  sleep_duration INTEGER,
  awake_time INTEGER,
  toss_turn_count INTEGER,
  hrv_avg INTEGER,
  respiratory_rate REAL,
  heart_rate INTEGER,
  raw_data TEXT,
  synced_at TEXT NOT NULL
);

-- Renpho body composition data
CREATE TABLE IF NOT EXISTS cached_renpho (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  timestamp TEXT NOT NULL UNIQUE,
  weight REAL NOT NULL,
  body_fat_percent REAL,
  muscle_mass REAL,
  bone_mass REAL,
  water_percent REAL,
  visceral_fat INTEGER,
  bmi REAL,
  metabolic_age INTEGER,
  bmr INTEGER,
  protein_percent REAL,
  subcutaneous_fat_percent REAL,
  raw_data TEXT,
  synced_at TEXT NOT NULL
);

-- Indices for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_eight_sleep_date ON cached_eight_sleep(date);
CREATE INDEX IF NOT EXISTS idx_renpho_date ON cached_renpho(date);
CREATE INDEX IF NOT EXISTS idx_renpho_timestamp ON cached_renpho(timestamp);

-- Sync log for tracking health data sync operations
CREATE TABLE IF NOT EXISTS health_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_count INTEGER,
  error_message TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT
);
