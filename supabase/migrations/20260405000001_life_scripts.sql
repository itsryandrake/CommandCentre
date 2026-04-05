-- Life Scripts with version history
CREATE TABLE life_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner TEXT NOT NULL CHECK (owner IN ('ryan', 'emily')),
  title TEXT NOT NULL DEFAULT 'Life Script',
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner)
);

CREATE TABLE life_script_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES life_scripts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_life_script_versions_script ON life_script_versions(script_id);
CREATE INDEX idx_life_script_versions_saved ON life_script_versions(saved_at DESC);
