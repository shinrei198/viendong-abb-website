CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  customer_name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT '',
  customer_type TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  items_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
