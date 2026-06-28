CREATE TABLE IF NOT EXISTS public.user_cash_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
  broker TEXT NOT NULL DEFAULT 'GATECEP-DEMO',
  currency TEXT NOT NULL DEFAULT 'KES',
  cash_balance NUMERIC(18,4) DEFAULT 0,
  source TEXT DEFAULT 'SYSTEM',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, broker, currency)
);