CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_assigned_to ON goals(assigned_to);
CREATE INDEX idx_goals_status ON goals(status);
