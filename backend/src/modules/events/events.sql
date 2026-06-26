CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(80) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'LOW',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'Gatecep',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_created
ON user_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_acknowledged
ON user_events (user_id, acknowledged);