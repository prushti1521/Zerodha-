CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty NUMERIC NOT NULL CHECK (qty > 0),
  avg NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  net TEXT,
  day TEXT,
  is_loss BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS positions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  name TEXT NOT NULL,
  qty NUMERIC NOT NULL,
  avg NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  net TEXT,
  day TEXT,
  is_loss BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  price NUMERIC NOT NULL CHECK (price >= 0),
  mode TEXT NOT NULL CHECK (mode IN ('BUY', 'SELL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_funds (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_fund_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('ADD', 'WITHDRAW', 'BUY', 'SELL')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(14, 2) NOT NULL CHECK (balance_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE demo_fund_transactions
  DROP CONSTRAINT IF EXISTS demo_fund_transactions_mode_check;
ALTER TABLE demo_fund_transactions
  ADD CONSTRAINT demo_fund_transactions_mode_check
  CHECK (mode IN ('ADD', 'WITHDRAW', 'BUY', 'SELL'));

CREATE INDEX IF NOT EXISTS holdings_user_id_idx ON holdings(user_id);
CREATE INDEX IF NOT EXISTS positions_user_id_idx ON positions(user_id);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS demo_fund_transactions_user_created_idx ON demo_fund_transactions(user_id, created_at DESC);