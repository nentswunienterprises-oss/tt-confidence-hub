DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'cto'
      AND enumtypid = 'role'::regtype
  ) THEN
    ALTER TYPE role ADD VALUE 'cto';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'cmo'
      AND enumtypid = 'role'::regtype
  ) THEN
    ALTER TYPE role ADD VALUE 'cmo';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_department') THEN
    CREATE TYPE executive_department AS ENUM ('ceo', 'coo', 'hr', 'cto', 'cmo');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_onboarding_status') THEN
    CREATE TYPE executive_onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_contribution_status') THEN
    CREATE TYPE executive_contribution_status AS ENUM ('not_contributing', 'building', 'contributing', 'at_risk');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_task_priority') THEN
    CREATE TYPE executive_task_priority AS ENUM ('critical', 'high', 'normal', 'low');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_task_status') THEN
    CREATE TYPE executive_task_status AS ENUM ('not_started', 'in_progress', 'blocked', 'submitted', 'approved', 'missed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_task_completion_result') THEN
    CREATE TYPE executive_task_completion_result AS ENUM ('done', 'delayed', 'failed', 'moved');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_proof_status') THEN
    CREATE TYPE executive_proof_status AS ENUM ('submitted', 'approved', 'rejected');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_time_log_value_type') THEN
    CREATE TYPE executive_time_log_value_type AS ENUM ('strategic', 'support', 'activity');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executive_weekly_record_type') THEN
    CREATE TYPE executive_weekly_record_type AS ENUM (
      'coo_operational_report',
      'ceo_feedback_record',
      'executive_direction_report',
      'department_report'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS executive_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department executive_department NOT NULL,
  title TEXT NOT NULL,
  mission TEXT,
  reporting_line TEXT,
  authority_level TEXT,
  core_responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  communication_rhythm TEXT,
  onboarding_status executive_onboarding_status NOT NULL DEFAULT 'not_started',
  contribution_status executive_contribution_status NOT NULL DEFAULT 'not_contributing',
  doctrine_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  consequence_logic_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP,
  contribution_activated_at TIMESTAMP,
  last_contribution_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executive_command_tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  department executive_department NOT NULL,
  owner_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  supporting_user_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  deadline TIMESTAMP NOT NULL,
  priority executive_task_priority NOT NULL DEFAULT 'normal',
  required_proof TEXT NOT NULL,
  proof_required_for_approval BOOLEAN NOT NULL DEFAULT TRUE,
  status executive_task_status NOT NULL DEFAULT 'not_started',
  completion_percent INTEGER NOT NULL DEFAULT 0,
  blocker_summary TEXT,
  blocker_needs TEXT,
  blocker_decision_needed TEXT,
  blocker_reported_at TIMESTAMP,
  ceo_visible BOOLEAN NOT NULL DEFAULT TRUE,
  ceo_notes TEXT,
  coo_notes TEXT,
  consequence_if_incomplete TEXT,
  completion_result executive_task_completion_result,
  direction_source TEXT,
  week_start_date TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executive_command_tasks_owner
  ON executive_command_tasks(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_executive_command_tasks_department
  ON executive_command_tasks(department);

CREATE INDEX IF NOT EXISTS idx_executive_command_tasks_deadline
  ON executive_command_tasks(deadline);

CREATE TABLE IF NOT EXISTS executive_task_time_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id VARCHAR NOT NULL REFERENCES executive_command_tasks(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_date TIMESTAMP NOT NULL,
  minutes_spent INTEGER NOT NULL,
  outcome_produced TEXT NOT NULL,
  proof_reference TEXT,
  role_aligned BOOLEAN NOT NULL DEFAULT TRUE,
  value_type executive_time_log_value_type NOT NULL DEFAULT 'support',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executive_task_time_logs_task
  ON executive_task_time_logs(task_id);

CREATE INDEX IF NOT EXISTS idx_executive_task_time_logs_user
  ON executive_task_time_logs(user_id);

CREATE TABLE IF NOT EXISTS executive_task_proofs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id VARCHAR NOT NULL REFERENCES executive_command_tasks(id) ON DELETE CASCADE,
  submitted_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  proof_type TEXT NOT NULL DEFAULT 'link',
  proof_url TEXT NOT NULL,
  notes TEXT,
  status executive_proof_status NOT NULL DEFAULT 'submitted',
  rejection_reason TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_executive_task_proofs_task
  ON executive_task_proofs(task_id);

CREATE INDEX IF NOT EXISTS idx_executive_task_proofs_submitter
  ON executive_task_proofs(submitted_by_user_id);

CREATE TABLE IF NOT EXISTS executive_weekly_records (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  week_start_date TIMESTAMP NOT NULL,
  record_type executive_weekly_record_type NOT NULL,
  department executive_department,
  created_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_decisions TEXT,
  risks TEXT,
  next_directions TEXT,
  needs_attention TEXT,
  source_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executive_weekly_records_week
  ON executive_weekly_records(week_start_date);

CREATE INDEX IF NOT EXISTS idx_executive_weekly_records_type
  ON executive_weekly_records(record_type);
