-- Add Google reviews column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_reviews jsonb;
