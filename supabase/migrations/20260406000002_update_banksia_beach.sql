-- Update Banksia Beach investment with property details
UPDATE investments
SET
  area_sqm = 713,
  image_url = 'https://i2.au.reastatic.net/800x600/0042e9858752d53bdeda07fa777cb9df65a25a0ee39be1cfa3fd0d41cd25d4ef/image.jpg',
  description = '4-bedroom, 2-bathroom house on 713 sqm in Banksia Beach QLD 4507. Built in 2021, featuring 2 car spaces and solar panels. Located within Moreton Bay council with NBN Fibre to the Premises. Estimated market value $1,400,000 (up 379.5% since land purchase in 2020).',
  updated_at = now()
WHERE name = '29 Bearberry Street' AND country = 'Australia';
