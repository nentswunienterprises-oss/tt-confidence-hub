-- Migration: Create parents table for onboarding type and affiliate code
CREATE TABLE IF NOT EXISTS parents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    onboarding_type varchar(32) NOT NULL DEFAULT 'commercial',
    affiliate_code varchar(64),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);