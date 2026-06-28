CREATE TABLE IF NOT EXISTS public.user_broker_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
  broker TEXT NOT NULL,
  broker_name TEXT,
  client_number TEXT,
  cds_number TEXT,
  email TEXT,
  status TEXT DEFAULT 'LINKED',
  source TEXT DEFAULT 'MOBILE_ONBOARDING',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, broker)
);