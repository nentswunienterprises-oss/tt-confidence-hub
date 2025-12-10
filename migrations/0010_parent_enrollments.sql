-- Create parent_enrollments table
CREATE TABLE IF NOT EXISTS parent_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_full_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_city TEXT NOT NULL,
  student_full_name TEXT NOT NULL,
  student_grade TEXT NOT NULL,
  school_name TEXT NOT NULL,
  math_struggle_areas TEXT NOT NULL,
  previous_tutoring TEXT NOT NULL,
  confidence_level TEXT NOT NULL,
  internet_access TEXT NOT NULL,
  parent_motivation TEXT,
  assigned_tutor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'not_enrolled',
  current_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('not_enrolled', 'awaiting_assignment', 'assigned', 'session_booked', 'report_received', 'confirmed')),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_parent_enrollments_user_id ON parent_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_enrollments_status ON parent_enrollments(status);

-- Disable RLS - authentication is handled in backend middleware
ALTER TABLE parent_enrollments DISABLE ROW LEVEL SECURITY;
