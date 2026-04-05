-- Properties and loans tracking
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primary', 'investment', 'other')),
  address TEXT,
  purchase_price NUMERIC,
  current_value NUMERIC,
  purchase_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mortgage', 'personal', 'car', 'other')),
  lender TEXT,
  original_amount NUMERIC,
  current_balance NUMERIC,
  interest_rate NUMERIC,
  monthly_payment NUMERIC,
  start_date DATE,
  end_date DATE,
  is_fixed_rate BOOLEAN DEFAULT true,
  fixed_rate_expiry DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_loans_property ON loans(property_id);
