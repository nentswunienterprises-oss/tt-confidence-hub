-- Fix RLS policy for parent_enrollments to check our custom users table instead of auth.users

-- Drop the problematic policy
DROP POLICY IF EXISTS "hr_read_enrollments" ON parent_enrollments;

-- Create new policy that checks our custom users table
CREATE POLICY "hr_read_enrollments" ON parent_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.id = auth.uid() 
      AND public.users.role IN ('hr', 'coo')
    )
  );

-- Also add an INSERT policy for parents to create their own enrollments
CREATE POLICY "parents_insert_enrollment" ON parent_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());
