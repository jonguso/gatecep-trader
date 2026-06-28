DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'investor_profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.investor_profiles
    ADD CONSTRAINT investor_profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;