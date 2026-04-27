-- Add identification type support for passports
-- This migration allows tutors to specify whether they're using SA ID or Passport

/* Update tutor_applications table for idType */
ALTER TABLE IF EXISTS tutor_applications
ADD COLUMN IF NOT EXISTS id_type VARCHAR DEFAULT 'sa_id';

COMMENT ON COLUMN tutor_applications.id_type IS 'Type of identification: sa_id (South African ID) or passport';

/* Create index for id_type for future filtering */
CREATE INDEX IF NOT EXISTS idx_tutor_applications_id_type ON tutor_applications(id_type);

/* Update tutor onboarding acceptances to store idType in form snapshot */
-- This is handled automatically as the form_snapshot_json will capture the idType field
-- No additional schema changes needed for this table
