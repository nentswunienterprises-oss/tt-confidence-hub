-- Disable RLS on parent_enrollments since we handle auth in the backend
ALTER TABLE parent_enrollments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "parents_read_own_enrollment" ON parent_enrollments;
DROP POLICY IF EXISTS "parents_update_own_enrollment" ON parent_enrollments;
DROP POLICY IF EXISTS "parents_insert_enrollment" ON parent_enrollments;
DROP POLICY IF EXISTS "hr_read_enrollments" ON parent_enrollments;
