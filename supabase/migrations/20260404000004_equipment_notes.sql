-- Equipment notes log (timestamped per item)
CREATE TABLE equipment_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT CHECK (created_by IN ('ryan', 'emily')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_equipment_notes_equipment ON equipment_notes(equipment_id);

-- Add product_url column
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS product_url TEXT;

-- Update status constraint to include sold/donated/thrown_out
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_status_check;
ALTER TABLE equipment ADD CONSTRAINT equipment_status_check
  CHECK (status IN ('working', 'needs_service', 'retired', 'sold', 'donated', 'thrown_out'));
