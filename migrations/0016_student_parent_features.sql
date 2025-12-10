-- Migration: Student & Parent Portal Features
-- Adds tables for commitments, reflections, assignments, and parent reports

-- ============================================
-- STUDENT COMMITMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS student_commitments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  why_commitment TEXT,
  daily_action TEXT,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_completed_date TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_commitments_student ON student_commitments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_commitments_active ON student_commitments(is_active);

-- ============================================
-- COMMITMENT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS commitment_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id VARCHAR NOT NULL REFERENCES student_commitments(id) ON DELETE CASCADE,
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  completed_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commitment_logs_commitment ON commitment_logs(commitment_id);
CREATE INDEX IF NOT EXISTS idx_commitment_logs_student ON commitment_logs(student_id);

-- ============================================
-- STUDENT REFLECTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS student_reflections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  reflection_text TEXT NOT NULL,
  mood VARCHAR,
  tags TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_reflections_student ON student_reflections(student_id);
CREATE INDEX IF NOT EXISTS idx_student_reflections_date ON student_reflections(date DESC);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  problems_assigned TEXT,
  due_date TIMESTAMP,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  student_result TEXT,
  student_work TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tutor ON assignments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_completed ON assignments(is_completed);

-- ============================================
-- PARENT REPORTS TABLE
-- ============================================

-- First create the enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE report_type AS ENUM ('weekly', 'monthly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS parent_reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  week_number INTEGER,
  month_name VARCHAR,
  
  summary TEXT NOT NULL,
  topics_learned TEXT,
  strengths TEXT,
  areas_for_growth TEXT,
  boss_battles_completed INTEGER NOT NULL DEFAULT 0,
  solutions_unlocked INTEGER NOT NULL DEFAULT 0,
  confidence_growth INTEGER,
  next_steps TEXT,
  
  parent_feedback TEXT,
  parent_feedback_at TIMESTAMP,
  
  sent_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_reports_student ON parent_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_parent ON parent_reports(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_type ON parent_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_parent_reports_sent_at ON parent_reports(sent_at DESC);

-- ============================================
-- UPDATE SESSIONS TABLE
-- ============================================
-- Add fields for tracking boss battles and solutions

ALTER TABLE tutoring_sessions 
  ADD COLUMN IF NOT EXISTS boss_battles_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS solutions_count INTEGER DEFAULT 0;

COMMENT ON COLUMN tutoring_sessions.boss_battles_count IS 'Number of boss battles completed in this session';
COMMENT ON COLUMN tutoring_sessions.solutions_count IS 'Number of 3-layer solutions taught in this session';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate student stats
CREATE OR REPLACE FUNCTION get_student_stats(p_student_id VARCHAR)
RETURNS TABLE (
  boss_battles_completed INTEGER,
  solutions_unlocked INTEGER,
  current_streak INTEGER,
  total_sessions INTEGER,
  confidence_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT 
      COALESCE(SUM(boss_battles_count), 0)::INTEGER as total_boss_battles,
      COALESCE(SUM(solutions_count), 0)::INTEGER as total_solutions,
      COUNT(*)::INTEGER as session_count
    FROM tutoring_sessions
    WHERE student_id = p_student_id
  ),
  streak_stats AS (
    SELECT 
      COALESCE(MAX(sc.streak_count), 0)::INTEGER as max_streak
    FROM student_commitments sc
    WHERE sc.student_id = p_student_id AND sc.is_active = true
  ),
  confidence_stats AS (
    SELECT 
      COALESCE(confidence_score, 50)::INTEGER as conf_level
    FROM students
    WHERE id = p_student_id
  )
  SELECT 
    ss.total_boss_battles,
    ss.total_solutions,
    str.max_streak,
    ss.session_count,
    cs.conf_level
  FROM session_stats ss
  CROSS JOIN streak_stats str
  CROSS JOIN confidence_stats cs;
END;
$$ LANGUAGE plpgsql;

-- Function to update commitment streak
CREATE OR REPLACE FUNCTION update_commitment_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_log_date DATE;
  yesterday DATE;
BEGIN
  -- Get the date of the last completion before this one
  SELECT completed_date::DATE INTO last_log_date
  FROM commitment_logs
  WHERE commitment_id = NEW.commitment_id
    AND id != NEW.id
  ORDER BY completed_date DESC
  LIMIT 1;
  
  yesterday := (NEW.completed_date::DATE - INTERVAL '1 day')::DATE;
  
  -- If completed yesterday, increment streak; otherwise reset to 1
  IF last_log_date = yesterday THEN
    UPDATE student_commitments
    SET streak_count = streak_count + 1,
        last_completed_date = NEW.completed_date
    WHERE id = NEW.commitment_id;
  ELSE
    UPDATE student_commitments
    SET streak_count = 1,
        last_completed_date = NEW.completed_date
    WHERE id = NEW.commitment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for streak updates
DROP TRIGGER IF EXISTS trigger_update_commitment_streak ON commitment_logs;
CREATE TRIGGER trigger_update_commitment_streak
  AFTER INSERT ON commitment_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_commitment_streak();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to add sample data for testing
-- INSERT INTO student_commitments (student_id, name, description, why_commitment, daily_action)
-- SELECT id, 'Practice Daily', 'Complete practice problems', 'To improve my skills', '15 minutes of focused practice'
-- FROM students LIMIT 1;
