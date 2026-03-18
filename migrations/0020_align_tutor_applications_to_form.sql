-- Migration: Align tutor_applications table columns to match the application form UI exactly.
-- Old schema used different names and JSONB blobs; new schema has a column per form question.

-- ============================================================
-- STEP 1: Rename columns where name changed
-- ============================================================
ALTER TABLE tutor_applications RENAME COLUMN full_names TO full_name;
ALTER TABLE tutor_applications RENAME COLUMN phone_number TO phone;
ALTER TABLE tutor_applications RENAME COLUMN current_status TO current_situation;
ALTER TABLE tutor_applications RENAME COLUMN bootcamp_available TO available_afternoon;

-- ============================================================
-- STEP 2: Replace commit_to_trial (boolean) with commitment (varchar 'yes'|'no')
-- ============================================================
ALTER TABLE tutor_applications ADD COLUMN commitment varchar;
UPDATE tutor_applications SET commitment = CASE WHEN commit_to_trial = true THEN 'yes' ELSE 'no' END;
ALTER TABLE tutor_applications ALTER COLUMN commitment SET NOT NULL;
ALTER TABLE tutor_applications DROP COLUMN commit_to_trial;

-- ============================================================
-- STEP 3: Drop old columns that have no equivalent in the UI form
-- ============================================================
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS who_influences;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS environment;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS mindset_data;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS grades_equipped;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS can_explain_clearly;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS tool_confidence;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS student_not_improving;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS psychological_data;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS vision_data;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS video_url;
ALTER TABLE tutor_applications DROP COLUMN IF EXISTS referral_source;

-- ============================================================
-- STEP 4: Add new columns for every form question not already present
-- ============================================================

-- Section 2 - Academic Background
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS completed_matric varchar;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS matric_year varchar;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS math_level varchar;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS math_result varchar;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS other_subjects text;

-- Section 3 - Current Situation
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS current_situation_other varchar;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS interest_reason text;

-- Section 4 - Teaching & Communication
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS helped_before varchar;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS help_explanation text;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS student_dont_get text;

-- Section 5 - Response Under Pressure
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS pressure_story text;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS pressure_response text[];
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS panic_cause text;

-- Section 6 - Discipline & Responsibility
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS discipline_reason text;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS repeat_mistake_response text;

-- Section 7 - Alignment With TT
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS tt_meaning text;
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS structure_preference varchar;

-- Section 8 - Availability
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS hours_per_week varchar;

-- Section 9 - Final Filter
ALTER TABLE tutor_applications ADD COLUMN IF NOT EXISTS final_reason text;
