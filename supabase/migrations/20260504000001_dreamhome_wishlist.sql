-- Dream Home Wishlist: shoppable item list separate from the inspiration board
CREATE TABLE IF NOT EXISTS dreamhome_wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text,
  image_url text,
  domain text,
  title text NOT NULL,
  description text,
  price numeric(10,2),
  room text NOT NULL DEFAULT 'Uncategorised',
  priority text NOT NULL DEFAULT 'Should-have',
  status text NOT NULL DEFAULT 'Wanted',
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dreamhome_wishlist_room ON dreamhome_wishlist(room);
CREATE INDEX IF NOT EXISTS idx_dreamhome_wishlist_status ON dreamhome_wishlist(status);
CREATE INDEX IF NOT EXISTS idx_dreamhome_wishlist_created_at ON dreamhome_wishlist(created_at DESC);
