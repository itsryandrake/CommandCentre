-- Redesign: properties → assets with expanded types
-- Add currency support, migrate data, seed new items

-- 1. Create new assets table
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('property', 'vehicle', 'investment', 'retirement_fund', 'bank', 'other')),
  description TEXT,
  address TEXT,
  purchase_price NUMERIC,
  current_value NUMERIC,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'AUD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Migrate existing properties into assets
INSERT INTO assets (id, name, type, address, purchase_price, current_value, purchase_date, created_at, updated_at)
SELECT id, name,
  CASE WHEN type IN ('primary', 'investment') THEN 'property' ELSE 'other' END,
  address, purchase_price, current_value, purchase_date, created_at, updated_at
FROM properties;

-- 3. Migrate loans FK from property_id to asset_id
ALTER TABLE loans ADD COLUMN asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;
UPDATE loans SET asset_id = property_id;
ALTER TABLE loans ADD COLUMN currency TEXT NOT NULL DEFAULT 'AUD';
ALTER TABLE loans DROP COLUMN property_id;
CREATE INDEX idx_loans_asset ON loans(asset_id);

-- 4. Drop old properties table and its index (CASCADE handles dependent FKs like property_details)
DROP INDEX IF EXISTS idx_loans_property;
DROP TABLE properties CASCADE;

-- 5. Seed additional assets from screenshots
INSERT INTO assets (name, type, description, address, purchase_price, current_value, currency)
VALUES
  ('SOL-C2908', 'property', 'Dubai off-plan property', NULL, 572017, 572017, 'AUD'),
  ('Mazda CX5', 'vehicle', NULL, NULL, 19300, 19300, 'AUD'),
  ('Mercedes Benz GLE 300d', 'vehicle', NULL, NULL, 99950, 99950, 'AUD'),
  ('Kingsgrove Property Trust Ordinary Units', 'investment', NULL, NULL, 987000, 987000, 'AUD'),
  ('Drake Wealth SMSF', 'retirement_fund', NULL, NULL, 135000, 135000, 'AUD');

-- 6. Seed additional debts
INSERT INTO loans (name, type, original_amount, current_balance, currency, notes)
VALUES
  ('David Drake Loan', 'personal', 550000, 550000, 'AUD', 'Personal loan from David Drake');

INSERT INTO loans (name, type, original_amount, current_balance, currency, asset_id, notes)
VALUES
  ('SOL-C2908 Owing', 'other', 457614, 457614, 'AUD',
   (SELECT id FROM assets WHERE name = 'SOL-C2908' LIMIT 1),
   'Outstanding amount owing on SOL-C2908 Dubai property');
