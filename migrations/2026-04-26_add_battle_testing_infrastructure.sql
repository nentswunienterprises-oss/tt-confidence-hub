DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'battle_test_subject') THEN
    CREATE TYPE battle_test_subject AS ENUM ('tutor', 'td');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'battle_test_score') THEN
    CREATE TYPE battle_test_score AS ENUM ('clear', 'partial', 'fail');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'battle_test_state') THEN
    CREATE TYPE battle_test_state AS ENUM ('locked', 'watchlist', 'fail');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS battle_test_runs (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pod_id varchar(255) NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  subject_type battle_test_subject NOT NULL,
  subject_user_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutor_assignment_id varchar(255) REFERENCES tutor_assignments(id) ON DELETE SET NULL,
  created_by_user_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_key varchar(255) NOT NULL,
  selected_phase_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  phase_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_phases jsonb NOT NULL DEFAULT '[]'::jsonb,
  critical_fail_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_questions integer NOT NULL DEFAULT 0,
  answered_questions integer NOT NULL DEFAULT 0,
  total_points real NOT NULL DEFAULT 0,
  possible_points real NOT NULL DEFAULT 0,
  alignment_percent real NOT NULL DEFAULT 0,
  state battle_test_state NOT NULL DEFAULT 'fail',
  has_critical_fail boolean NOT NULL DEFAULT false,
  action_required text,
  completed_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS battle_test_rep_logs (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  run_id varchar(255) NOT NULL REFERENCES battle_test_runs(id) ON DELETE CASCADE,
  phase_key varchar(255) NOT NULL,
  question_key varchar(255) NOT NULL,
  section varchar(255) NOT NULL,
  question_order integer NOT NULL,
  prompt text NOT NULL,
  expected_answer text NOT NULL,
  fail_indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  score battle_test_score NOT NULL,
  points_awarded real NOT NULL DEFAULT 0,
  note text,
  is_critical_fail boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_battle_test_runs_pod_id ON battle_test_runs(pod_id);
CREATE INDEX IF NOT EXISTS idx_battle_test_runs_subject_user_id ON battle_test_runs(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_battle_test_runs_tutor_assignment_id ON battle_test_runs(tutor_assignment_id);
CREATE INDEX IF NOT EXISTS idx_battle_test_runs_completed_at ON battle_test_runs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_test_rep_logs_run_id ON battle_test_rep_logs(run_id);
