ALTER TABLE scheduled_sessions
ADD COLUMN IF NOT EXISTS google_meet_space_name varchar(255),
ADD COLUMN IF NOT EXISTS google_meet_code varchar(32),
ADD COLUMN IF NOT EXISTS transcript_status varchar(32) NOT NULL DEFAULT 'not_expected_yet',
ADD COLUMN IF NOT EXISTS transcript_file_id varchar(255),
ADD COLUMN IF NOT EXISTS transcript_detected_at timestamptz,
ADD COLUMN IF NOT EXISTS attendance_report_file_id varchar(255),
ADD COLUMN IF NOT EXISTS cohost_sync_status varchar(32) NOT NULL DEFAULT 'not_configured',
ADD COLUMN IF NOT EXISTS cohost_sync_error text,
ADD COLUMN IF NOT EXISTS last_artifact_sync_at timestamptz,
ADD COLUMN IF NOT EXISTS last_meet_sync_error text;

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_google_meet_space_name
ON scheduled_sessions(google_meet_space_name);

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_google_meet_code
ON scheduled_sessions(google_meet_code);
