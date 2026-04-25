-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK(category IN (
    'personal', 'health_wellness', 'money_finances',
    'business', 'play_adventure', 'faith_contribution', 'family'
  )),
  desired_feeling TEXT,
  assigned_to TEXT NOT NULL DEFAULT 'both' CHECK(assigned_to IN ('ryan', 'emily', 'both')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'archived')),
  sort_order INTEGER DEFAULT 0,
  target_date TEXT,
  completed_at TIMESTAMPTZ,
  year INTEGER NOT NULL DEFAULT 2026,
  cost NUMERIC,
  next_step TEXT,
  next_step_due TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_assigned_to ON goals(assigned_to);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_year ON goals(year);

-- Year metadata
CREATE TABLE IF NOT EXISTS goal_years (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  theme TEXT,
  purpose TEXT,
  outcomes TEXT,
  target_monthly_income NUMERIC,
  target_daily_income NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category intentions per year
CREATE TABLE IF NOT EXISTS goal_year_intentions (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  intention TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(year, category)
);

-- Quarterly reviews per goal
CREATE TABLE IF NOT EXISTS goal_reviews (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL CHECK(quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(goal_id, quarter, year)
);

CREATE INDEX idx_goal_reviews_goal_id ON goal_reviews(goal_id);

-- RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON goals FOR ALL USING (true);

ALTER TABLE goal_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON goal_years FOR ALL USING (true);

ALTER TABLE goal_year_intentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON goal_year_intentions FOR ALL USING (true);

ALTER TABLE goal_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON goal_reviews FOR ALL USING (true);
