CREATE TABLE IF NOT EXISTS receipts (
  id           TEXT PRIMARY KEY,
  filename     TEXT NOT NULL,
  category     TEXT NOT NULL,
  subcategory  TEXT,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  uploaded_at  TEXT NOT NULL,
  notes        TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  UNIQUE (category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_receipts_uploaded_at ON receipts(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
