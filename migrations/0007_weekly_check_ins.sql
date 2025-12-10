-- Create weekly_check_ins table
CREATE TABLE IF NOT EXISTS weekly_check_ins (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pod_id VARCHAR NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  week_start_date TIMESTAMP NOT NULL,
  sessions_summary TEXT,
  wins TEXT,
  challenges TEXT,
  emotions TEXT,
  skill_improvement TEXT,
  help_needed TEXT,
  next_week_goals TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_check_ins_tutor_id ON weekly_check_ins(tutor_id);
CREATE INDEX IF NOT EXISTS idx_weekly_check_ins_pod_id ON weekly_check_ins(pod_id);
CREATE INDEX IF NOT EXISTS idx_weekly_check_ins_week_start ON weekly_check_ins(week_start_date);
