-- Household documents (insurance, tax, utility bills, warranties, etc.)
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  storage_path TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'insurance', 'tax', 'utility', 'warranty', 'council',
    'vehicle', 'medical', 'financial', 'other'
  )),
  subcategory TEXT,
  document_title TEXT,
  provider TEXT,
  policy_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  amount NUMERIC,
  amount_label TEXT,
  key_details JSONB DEFAULT '{}',
  ai_summary TEXT,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  uploaded_by TEXT CHECK (uploaded_by IS NULL OR uploaded_by IN ('ryan', 'emily')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_subcategory ON documents(subcategory);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);
CREATE INDEX idx_documents_equipment ON documents(equipment_id);
