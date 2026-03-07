-- Migration: Create scheduled_sessions table for intro session scheduling
CREATE TABLE IF NOT EXISTS scheduled_sessions (
    id varchar(64) PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id varchar(64) NOT NULL,
    tutor_id varchar(64) NOT NULL,
    student_id varchar(64),
    scheduled_time timestamptz NOT NULL,
    type varchar(32) NOT NULL, -- e.g., 'intro'
    status varchar(64) NOT NULL, -- e.g., 'pending_tutor_confirmation', 'confirmed', etc.
    parent_confirmed boolean NOT NULL DEFAULT false,
    tutor_confirmed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_tutor_id ON scheduled_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_parent_id ON scheduled_sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_type ON scheduled_sessions(type);