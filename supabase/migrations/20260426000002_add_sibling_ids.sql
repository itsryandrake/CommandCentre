ALTER TABLE contacts ADD COLUMN IF NOT EXISTS sibling_ids jsonb DEFAULT '[]'::jsonb;
