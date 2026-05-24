-- Add sandbox isolation flags to existing billing tables for live databases.

ALTER TABLE IF EXISTS membership_months
  ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS session_billing_events
  ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_months_unique_parent_student_month_sandbox
  ON membership_months(parent_id, student_id, month_key, is_sandbox);
