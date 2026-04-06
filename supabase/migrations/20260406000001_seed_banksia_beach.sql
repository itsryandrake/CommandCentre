-- Seed: 29 Bearberry Street, Banksia Beach property, loan, and investment

-- Property (asset tracking)
INSERT INTO properties (name, type, address, purchase_price, current_value)
VALUES (
  '29 Bearberry Street, Banksia Beach',
  'investment',
  '29 Bearberry Street, Banksia Beach QLD 4507',
  292000,
  1400000
);

-- Loan (liability tracking)
INSERT INTO loans (property_id, name, type, lender, original_amount, current_balance, interest_rate, start_date, is_fixed_rate, notes)
VALUES (
  (SELECT id FROM properties WHERE address ILIKE '%Bearberry%' LIMIT 1),
  'Bendigo Flex Variable Home Loan',
  'mortgage',
  'Bendigo Bank',
  458391.00,
  412945.07,
  6.04,
  '2025-12-02',
  false,
  'BSB: 633000, Account: 704664887. Remaining repayments: 294. In arrears: $2,631.00. Next payment due: 2 May 2026.'
);

-- Investment (so it appears on the Investments page too)
INSERT INTO investments (name, project_name, purchase_price_local, purchase_price_aud, currency, location, country, status, description, notes)
VALUES (
  '29 Bearberry Street',
  'Banksia Beach',
  292000,
  292000,
  'AUD',
  'Banksia Beach QLD 4507',
  'Australia',
  'settled',
  'Investment property at 29 Bearberry Street, Banksia Beach. Estimated market value $1,400,000.',
  'Purchased for $292,000. Estimated current value: $1,400,000 (+$1,108,000). Bendigo Bank mortgage: $412,945.07 at 6.04% variable.'
);
