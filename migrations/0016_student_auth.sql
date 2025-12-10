-- Add parent_code to onboarding_proposals
ALTER TABLE onboarding_proposals ADD COLUMN parent_code VARCHAR(8) UNIQUE;

-- Create student_users table for student authentication
CREATE TABLE IF NOT EXISTS student_users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  student_id VARCHAR REFERENCES students(id),
  parent_code VARCHAR(8) REFERENCES onboarding_proposals(parent_code),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP
);

-- Create index on parent_code for faster lookups
CREATE INDEX idx_student_users_parent_code ON student_users(parent_code);
CREATE INDEX idx_onboarding_proposals_parent_code ON onboarding_proposals(parent_code);

-- Create sessions table for student auth (if needed separately)
CREATE TABLE IF NOT EXISTS student_sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_student_session_expire ON student_sessions(expire);
