ALTER TABLE public.investor_profiles
ADD CONSTRAINT investor_profiles_user_id_unique UNIQUE (user_id);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);