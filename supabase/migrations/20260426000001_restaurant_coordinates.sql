-- Add latitude/longitude columns to restaurants for map display
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS longitude double precision;
