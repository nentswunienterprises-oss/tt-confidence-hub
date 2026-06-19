CREATE TABLE IF NOT EXISTS executive_role_appointments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role executive_department NOT NULL UNIQUE,
  appointed_user_id VARCHAR UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  appointed_by_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  appointed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executive_role_appointments_appointed_user
  ON executive_role_appointments(appointed_user_id);

CREATE INDEX IF NOT EXISTS idx_executive_role_appointments_appointed_by
  ON executive_role_appointments(appointed_by_user_id);
