CREATE TABLE IF NOT EXISTS payment_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_id VARCHAR NOT NULL,
  enrollment_id VARCHAR NOT NULL,
  proposal_id VARCHAR,
  student_id VARCHAR,
  tutor_id VARCHAR,
  provider VARCHAR(32) NOT NULL DEFAULT 'payfast',
  merchant_reference VARCHAR(120) NOT NULL UNIQUE,
  payfast_payment_id VARCHAR(120),
  plan VARCHAR(64) NOT NULL DEFAULT 'Premium',
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'ZAR',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  itn_received_at TIMESTAMPTZ,
  tutor_share DECIMAL(10, 2) NOT NULL DEFAULT 750.00,
  platform_share DECIMAL(10, 2) NOT NULL DEFAULT 250.00,
  item_name VARCHAR(120),
  item_description TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_parent_id
  ON payment_transactions(parent_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_enrollment_id
  ON payment_transactions(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_proposal_id
  ON payment_transactions(proposal_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_student_id
  ON payment_transactions(student_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_tutor_id
  ON payment_transactions(tutor_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
  ON payment_transactions(payment_status);
