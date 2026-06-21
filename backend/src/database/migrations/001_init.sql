CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  customer_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  goal TEXT NOT NULL,
  risk TEXT NOT NULL,
  experience TEXT,
  time_horizon TEXT,
  contribution TEXT,
  investor_type TEXT,
  constraints JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  broker TEXT NOT NULL,
  client_number TEXT NOT NULL,
  cds_number TEXT NOT NULL,
  email TEXT,
  source TEXT DEFAULT 'EXISTING_INVESTOR',
  recommended_broker JSONB,
  customer_profile JSONB,
  status TEXT DEFAULT 'LINKED_PENDING_UPLOAD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (broker, client_number, cds_number)
);

CREATE TABLE IF NOT EXISTS broker_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_link_id UUID REFERENCES broker_links(id),
  broker TEXT NOT NULL,
  report_type TEXT NOT NULL,
  filename TEXT,
  imported_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_link_id UUID REFERENCES broker_links(id),
  broker TEXT NOT NULL,
  client_number TEXT,
  cds_number TEXT,
  report_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  sector TEXT,
  quantity NUMERIC DEFAULT 0,
  average_price NUMERIC DEFAULT 0,
  market_price NUMERIC DEFAULT 0,
  market_value NUMERIC DEFAULT 0,
  profit_loss NUMERIC DEFAULT 0,
  profit_loss_pct NUMERIC DEFAULT 0,
  raw JSONB DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_cash (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_link_id UUID REFERENCES broker_links(id),
  broker TEXT NOT NULL,
  client_number TEXT,
  cds_number TEXT,
  transaction_date TEXT,
  description TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  raw JSONB DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_link_id UUID REFERENCES broker_links(id),
  broker TEXT NOT NULL,
  client_number TEXT,
  cds_number TEXT,
  symbol TEXT,
  action TEXT,
  quantity NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  reason TEXT,
  ai_confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
