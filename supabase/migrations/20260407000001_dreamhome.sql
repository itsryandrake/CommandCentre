-- Dream Home inspiration board tables

CREATE TABLE IF NOT EXISTS dreamhome_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text,
  image_url text NOT NULL,
  original_image_url text,
  title text,
  notes text,
  source_domain text,
  ai_description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dreamhome_image_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid NOT NULL REFERENCES dreamhome_images(id) ON DELETE CASCADE,
  tag text NOT NULL,
  confidence real DEFAULT 1.0,
  UNIQUE(image_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_dreamhome_image_tags_image_id ON dreamhome_image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_dreamhome_image_tags_tag ON dreamhome_image_tags(tag);
CREATE INDEX IF NOT EXISTS idx_dreamhome_images_created_at ON dreamhome_images(created_at DESC);
