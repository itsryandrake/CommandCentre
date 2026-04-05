-- New columns on goals
ALTER TABLE goals ADD COLUMN year INTEGER NOT NULL DEFAULT 2026;
ALTER TABLE goals ADD COLUMN cost REAL;
ALTER TABLE goals ADD COLUMN next_step TEXT;
ALTER TABLE goals ADD COLUMN next_step_due TEXT;

-- Year metadata
CREATE TABLE IF NOT EXISTS goal_years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL UNIQUE,
  theme TEXT,
  purpose TEXT,
  outcomes TEXT,
  target_monthly_income REAL,
  target_daily_income REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Category intentions per year
CREATE TABLE IF NOT EXISTS goal_year_intentions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  intention TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(year, category)
);

-- Quarterly reviews per goal
CREATE TABLE IF NOT EXISTS goal_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL CHECK(quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(goal_id, quarter, year)
);

CREATE INDEX idx_goals_year ON goals(year);
CREATE INDEX idx_goal_reviews_goal_id ON goal_reviews(goal_id);
