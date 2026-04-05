-- Investment properties
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  project_name TEXT,
  tower TEXT,
  unit_number TEXT,
  area_sqft NUMERIC,
  area_sqm NUMERIC,
  purchase_price_local NUMERIC,
  purchase_price_aud NUMERIC,
  currency TEXT DEFAULT 'AED',
  location TEXT,
  country TEXT,
  status TEXT DEFAULT 'off_plan' CHECK (status IN ('off_plan', 'under_construction', 'completed', 'settled')),
  completion_date TEXT,
  description TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment schedule (paid + upcoming)
CREATE TABLE investment_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount_local NUMERIC NOT NULL,
  amount_aud NUMERIC,
  date_due DATE,
  date_paid DATE,
  is_paid BOOLEAN DEFAULT false,
  percentage NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents stored against investment
CREATE TABLE investment_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by TEXT CHECK (uploaded_by IN ('ryan', 'emily')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks specific to investment
CREATE TABLE investment_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_investment_payments ON investment_payments(investment_id);
CREATE INDEX idx_investment_documents ON investment_documents(investment_id);
CREATE INDEX idx_investment_tasks ON investment_tasks(investment_id);
