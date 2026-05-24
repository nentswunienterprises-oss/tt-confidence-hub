-- Session billing architecture MVP
-- Policy: calendar month quota, no carryover, 8 credits/month

CREATE TABLE IF NOT EXISTS membership_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  enrollment_id TEXT,
  month_start DATE NOT NULL,
  month_key TEXT NOT NULL,
  session_quota INTEGER NOT NULL DEFAULT 8,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  sessions_remaining INTEGER NOT NULL DEFAULT 8,
  is_sandbox BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_months_unique_parent_student_month
  ON membership_months(parent_id, student_id, month_key, is_sandbox);

CREATE INDEX IF NOT EXISTS idx_membership_months_parent_month
  ON membership_months(parent_id, month_start DESC);

CREATE TABLE IF NOT EXISTS session_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  enrollment_id TEXT,
  event_type TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  billing_impact TEXT NOT NULL DEFAULT 'none',
  credits_delta INTEGER NOT NULL DEFAULT 0,
  reason_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_sandbox BOOLEAN NOT NULL DEFAULT false,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_billing_events_session
  ON session_billing_events(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_billing_events_parent_month
  ON session_billing_events(parent_id, effective_at DESC);

