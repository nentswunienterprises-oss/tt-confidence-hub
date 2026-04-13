ALTER TABLE scheduled_sessions
ADD COLUMN IF NOT EXISTS scheduled_end timestamptz,
ADD COLUMN IF NOT EXISTS timezone varchar(64) NOT NULL DEFAULT 'Africa/Johannesburg',
ADD COLUMN IF NOT EXISTS workflow_stage varchar(64),
ADD COLUMN IF NOT EXISTS host_account_id varchar(128),
ADD COLUMN IF NOT EXISTS google_calendar_id varchar(255),
ADD COLUMN IF NOT EXISTS google_event_id varchar(255),
ADD COLUMN IF NOT EXISTS google_meet_url text,
ADD COLUMN IF NOT EXISTS google_conference_id varchar(255),
ADD COLUMN IF NOT EXISTS attendance_status varchar(32) NOT NULL DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS recording_status varchar(32) NOT NULL DEFAULT 'not_expected_yet',
ADD COLUMN IF NOT EXISTS recording_file_id varchar(255),
ADD COLUMN IF NOT EXISTS recording_detected_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_student_type ON scheduled_sessions(student_id, type);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_status ON scheduled_sessions(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_scheduled_time ON scheduled_sessions(scheduled_time);

CREATE TABLE IF NOT EXISTS training_session_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_session_id uuid NOT NULL REFERENCES scheduled_sessions(id) ON DELETE CASCADE,
    student_id uuid NOT NULL,
    tutor_id varchar(64) NOT NULL,
    topic_count integer NOT NULL DEFAULT 0,
    started_at timestamptz NOT NULL DEFAULT now(),
    submitted_at timestamptz,
    status varchar(32) NOT NULL DEFAULT 'in_progress',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_session_runs_scheduled_session_id
ON training_session_runs(scheduled_session_id);

ALTER TABLE IF EXISTS intro_session_drills
ADD COLUMN IF NOT EXISTS scheduled_session_id uuid,
ADD COLUMN IF NOT EXISTS training_session_run_id uuid;
