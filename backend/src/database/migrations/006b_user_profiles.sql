CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.auth_users(id) ON DELETE CASCADE,
  phone VARCHAR(50),
  country VARCHAR(100),
  preferred_broker VARCHAR(100),
  theme VARCHAR(50) DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);