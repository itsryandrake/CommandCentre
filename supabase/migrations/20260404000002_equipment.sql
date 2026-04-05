-- Home equipment tracking
CREATE TABLE equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'working' CHECK (status IN ('working', 'needs_service', 'retired')),
  image_url TEXT,
  purchase_date DATE,
  purchase_price NUMERIC,
  warranty_expiry DATE,
  last_serviced DATE,
  next_service_due DATE,
  service_interval_months INTEGER,
  location TEXT,
  notes TEXT,
  added_by TEXT CHECK (added_by IN ('ryan', 'emily')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
