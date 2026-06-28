CREATE TABLE IF NOT EXISTS public.auth_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);