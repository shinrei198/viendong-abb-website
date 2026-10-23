CREATE TABLE IF NOT EXISTS cms_sections (
  section_key TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_migrations (
  migration_key TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_cms_sections_updated_at
  ON cms_sections(updated_at DESC);
