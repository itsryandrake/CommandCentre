-- Loyalty programs table
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  status_tier TEXT NOT NULL DEFAULT 'Member',
  member_number TEXT NOT NULL DEFAULT '',
  benefits JSONB NOT NULL DEFAULT '[]',
  colour TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON loyalty_programs FOR ALL USING (true);
