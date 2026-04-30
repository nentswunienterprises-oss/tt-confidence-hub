DO $$
BEGIN
  CREATE TYPE tutor_certification_mode AS ENUM ('training', 'sandbox', 'certified_live', 'watchlist', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tutor_deep_dive_historical_state AS ENUM ('in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tutor_deep_dive_health_state AS ENUM ('locked', 'watchlist', 'drift');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tutor_battle_test_statuses (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_assignment_id varchar NOT NULL REFERENCES tutor_assignments(id),
  tutor_id varchar NOT NULL REFERENCES users(id),
  mode tutor_certification_mode NOT NULL DEFAULT 'training',
  module_progress jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_battle_tests jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_synced_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_battle_test_status_assignment
  ON tutor_battle_test_statuses (tutor_assignment_id);

CREATE INDEX IF NOT EXISTS idx_tutor_battle_test_status_tutor
  ON tutor_battle_test_statuses (tutor_id);

CREATE TABLE IF NOT EXISTS tutor_battle_test_deep_dive_progress (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_assignment_id varchar NOT NULL REFERENCES tutor_assignments(id),
  tutor_id varchar NOT NULL REFERENCES users(id),
  phase_key varchar NOT NULL,
  title varchar NOT NULL,
  module_key varchar NOT NULL,
  module_title varchar NOT NULL,
  historical_state tutor_deep_dive_historical_state NOT NULL DEFAULT 'in_progress',
  current_health_state tutor_deep_dive_health_state NOT NULL DEFAULT 'drift',
  current_streak integer NOT NULL DEFAULT 0,
  latest_score real,
  completed_at timestamp,
  last_tested_at timestamp,
  attempts_count integer NOT NULL DEFAULT 0,
  critical_flag boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_deep_dive_progress_assignment
  ON tutor_battle_test_deep_dive_progress (tutor_assignment_id);

CREATE INDEX IF NOT EXISTS idx_tutor_deep_dive_progress_tutor
  ON tutor_battle_test_deep_dive_progress (tutor_id);

CREATE INDEX IF NOT EXISTS idx_tutor_deep_dive_progress_phase
  ON tutor_battle_test_deep_dive_progress (phase_key);
