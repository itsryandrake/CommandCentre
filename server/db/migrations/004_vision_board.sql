CREATE TABLE IF NOT EXISTS vision_board_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK(media_type IN ('image', 'video')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
