CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  items TEXT NOT NULL DEFAULT '[]',
  coupon TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_carts_token ON carts(token);
