CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  broker TEXT,
  status TEXT NOT NULL,
  broker_status TEXT,
  filled_quantity NUMERIC DEFAULT 0,
  remaining_quantity NUMERIC DEFAULT 0,
  average_fill_price NUMERIC DEFAULT 0,
  fill_percent NUMERIC DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 1,
  rejection_reason TEXT,
  last_broker_attempt TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_events (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS broker_accounts (
  broker TEXT PRIMARY KEY,
  account_number TEXT NOT NULL,
  cash_balance NUMERIC DEFAULT 0,
  portfolio_value NUMERIC DEFAULT 0,
  buying_power NUMERIC DEFAULT 0,
  connected BOOLEAN DEFAULT true,
  preferred BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pnl_ledger (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  average_cost NUMERIC NOT NULL,
  sell_price NUMERIC NOT NULL,
  broker TEXT,
  realized_pnl NUMERIC NOT NULL,
  realized_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS parent_executions (
  id SERIAL PRIMARY KEY,
  parent_id TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  parent_quantity NUMERIC NOT NULL,
  execution_style TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS child_orders (
  id SERIAL PRIMARY KEY,
  child_id TEXT UNIQUE NOT NULL,
  parent_id TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  status TEXT,
  broker TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS execution_fills (
  id SERIAL PRIMARY KEY,
  fill_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  broker TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

