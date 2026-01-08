-- MIGRATION: Strict RLS for all main tables
-- This migration enables RLS and applies strict policies to protect all data.
-- Only owners can access their own rows; HR/admin can access all.

-- 1. parent_enrollments

-- 1. parent_enrollments
ALTER TABLE parent_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parents_read_own_enrollment" ON parent_enrollments;
DROP POLICY IF EXISTS "parents_update_own_enrollment" ON parent_enrollments;
DROP POLICY IF EXISTS "parents_insert_enrollment" ON parent_enrollments;
DROP POLICY IF EXISTS "hr_read_enrollments" ON parent_enrollments;
CREATE POLICY "Parents can access own" ON parent_enrollments
  FOR ALL USING (user_id = auth.uid()::uuid);
CREATE POLICY "HR can access all" ON parent_enrollments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 2. people_registry

-- 2. people_registry
ALTER TABLE people_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON people_registry;
CREATE POLICY "Owner can access own" ON people_registry
  FOR ALL USING (user_id = auth.uid()::varchar);
CREATE POLICY "HR can access all" ON people_registry
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 3. details

-- 3. details
ALTER TABLE details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON details;
CREATE POLICY "Owner can access own" ON details
  FOR ALL USING (created_by = auth.uid()::varchar);
CREATE POLICY "HR can access all" ON details
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 4. projects

-- 4. projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON projects;
CREATE POLICY "Owner can access own" ON projects
  FOR ALL USING (owner_id = auth.uid()::varchar);
CREATE POLICY "HR can access all" ON projects
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));


-- 5. project_details
ALTER TABLE project_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON project_details;
CREATE POLICY "HR can access all" ON project_details
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 6. ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON ideas;
CREATE POLICY "Submitter can access own" ON ideas
  FOR ALL USING (submitted_by = auth.uid()::varchar);
CREATE POLICY "HR can access all" ON ideas
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 7. disputes
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON disputes;
CREATE POLICY "Logger can access own" ON disputes
  FOR ALL USING (logged_by = auth.uid()::varchar);
CREATE POLICY "HR can access all" ON disputes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 8. dispute_resolutions
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON dispute_resolutions;
CREATE POLICY "Resolver can access own" ON dispute_resolutions
  FOR ALL USING (resolved_by = auth.uid()::varchar);
CREATE POLICY "HR can access all" ON dispute_resolutions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 9. affiliate_codes
ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate can access own" ON affiliate_codes
  FOR ALL USING (affiliate_id = auth.uid()::uuid);
CREATE POLICY "HR can access all" ON affiliate_codes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 10. encounters
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate can access own" ON encounters
  FOR ALL USING (affiliate_id = auth.uid()::uuid);
CREATE POLICY "HR can access all" ON encounters
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 11. leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate can access own" ON leads
  FOR ALL USING (affiliate_id = auth.uid()::uuid);
CREATE POLICY "HR can access all" ON leads
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 12. closes
ALTER TABLE closes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate can access own" ON closes
  FOR ALL USING (affiliate_id = auth.uid()::uuid);
CREATE POLICY "HR can access all" ON closes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- 13. affiliate_reflections
ALTER TABLE affiliate_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate can access own" ON affiliate_reflections
  FOR ALL USING (affiliate_id = auth.uid()::uuid);
CREATE POLICY "HR can access all" ON affiliate_reflections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::varchar AND role IN ('hr', 'coo')));

-- END STRICT RLS MIGRATION
