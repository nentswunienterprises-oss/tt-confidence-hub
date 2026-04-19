DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'onboarding_acceptance_method'
  ) THEN
    CREATE TYPE onboarding_acceptance_method AS ENUM ('checkbox_typed_name');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tutor_onboarding_acceptances (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  application_id varchar(255) NOT NULL REFERENCES tutor_applications(id) ON DELETE CASCADE,
  user_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_step integer NOT NULL,
  document_code varchar(64) NOT NULL,
  document_title varchar(255) NOT NULL,
  document_version varchar(64) NOT NULL,
  document_effective_date varchar(64),
  document_last_updated_at timestamptz,
  document_snapshot text NOT NULL,
  document_checksum varchar(128) NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  accepted_timezone varchar(64),
  acceptance_method onboarding_acceptance_method NOT NULL DEFAULT 'checkbox_typed_name',
  typed_full_name varchar(255) NOT NULL,
  account_email varchar(255) NOT NULL,
  phone_number_snapshot varchar(64),
  ip_address varchar(128),
  user_agent text,
  device_type varchar(64),
  platform varchar(32),
  session_id varchar(255),
  locale varchar(32),
  source_flow varchar(128),
  accepted_clauses_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  scroll_completion_percent integer,
  view_started_at timestamptz,
  view_completed_at timestamptz,
  accept_clicked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_onboarding_acceptances_application_step
  ON tutor_onboarding_acceptances (application_id, document_step, accepted_at DESC);

CREATE INDEX IF NOT EXISTS idx_tutor_onboarding_acceptances_user
  ON tutor_onboarding_acceptances (user_id, accepted_at DESC);

CREATE TABLE IF NOT EXISTS tutor_onboarding_clause_acknowledgements (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  acceptance_id varchar(255) NOT NULL REFERENCES tutor_onboarding_acceptances(id) ON DELETE CASCADE,
  clause_key varchar(128) NOT NULL,
  clause_label text NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_onboarding_clause_ack_acceptance
  ON tutor_onboarding_clause_acknowledgements (acceptance_id);

CREATE TABLE IF NOT EXISTS tutor_onboarding_acceptance_events (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  acceptance_id varchar(255) REFERENCES tutor_onboarding_acceptances(id) ON DELETE CASCADE,
  application_id varchar(255) NOT NULL REFERENCES tutor_applications(id) ON DELETE CASCADE,
  user_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_step integer NOT NULL,
  event_type varchar(64) NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_onboarding_acceptance_events_application
  ON tutor_onboarding_acceptance_events (application_id, created_at DESC);
