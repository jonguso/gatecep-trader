CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.user_cash_balances
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE public.user_portfolios
ALTER COLUMN id SET DEFAULT uuid_generate_v4();