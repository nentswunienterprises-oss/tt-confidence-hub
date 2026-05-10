CREATE TABLE IF NOT EXISTS tutor_portable_certification_snapshots (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id varchar NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  source_assignment_id varchar REFERENCES tutor_assignments(id) ON DELETE SET NULL,
  mode tutor_certification_mode NOT NULL DEFAULT 'training',
  module_progress jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_battle_tests jsonb NOT NULL DEFAULT '[]'::jsonb,
  deep_dive_progress jsonb NOT NULL DEFAULT '[]'::jsonb,
  certification_recovery_note text,
  recovery_required_until timestamp,
  last_synced_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_portable_certification_snapshots_tutor
  ON tutor_portable_certification_snapshots (tutor_id);

CREATE INDEX IF NOT EXISTS idx_tutor_portable_certification_snapshots_updated
  ON tutor_portable_certification_snapshots (updated_at DESC);
