-- Remove duplicate Bendigo Flex Variable Home Loan (keep the one linked to an asset)
DELETE FROM loans
WHERE name = 'Bendigo Flex Variable Home Loan'
  AND asset_id IS NULL;

-- Rename SOL-C2908 to Sobha Solis under Property assets
UPDATE assets
SET name = 'Sobha Solis', updated_at = now()
WHERE name ILIKE '%SOL-C2908%' OR name ILIKE '%sol%c2908%';
