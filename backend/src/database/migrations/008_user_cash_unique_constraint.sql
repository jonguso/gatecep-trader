DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_cash_balances_user_broker_currency_unique'
  ) THEN
    ALTER TABLE public.user_cash_balances
    ADD CONSTRAINT user_cash_balances_user_broker_currency_unique
    UNIQUE (user_id, broker, currency);
  END IF;
END $$;