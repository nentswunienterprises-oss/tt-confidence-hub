-- Add applicant mode to tutor certification enum
DO $$
BEGIN
  -- Drop existing type and recreate with applicant mode
  ALTER TYPE tutor_certification_mode RENAME TO tutor_certification_mode_old;
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tutor_certification_mode AS ENUM ('applicant', 'training', 'sandbox', 'certified_live', 'watchlist', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update tutor_battle_test_statuses to use new enum
DO $$
BEGIN
  ALTER TABLE tutor_battle_test_statuses ALTER COLUMN mode TYPE tutor_certification_mode USING mode::text::tutor_certification_mode;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add is_sandbox_account flag to parent_enrollments to mark fake accounts for tutor training
ALTER TABLE parent_enrollments
ADD COLUMN IF NOT EXISTS is_sandbox_account boolean NOT NULL DEFAULT false;

-- Add index for efficient sandbox account lookups
CREATE INDEX IF NOT EXISTS idx_parent_enrollments_sandbox
  ON parent_enrollments (is_sandbox_account)
  WHERE is_sandbox_account = true;

-- Add certification_recovery_note column to track why tutor was moved back to training
ALTER TABLE tutor_battle_test_statuses
ADD COLUMN IF NOT EXISTS certification_recovery_note TEXT,
ADD COLUMN IF NOT EXISTS recovery_required_until timestamp;

-- Add index for tutor mode queries
CREATE INDEX IF NOT EXISTS idx_tutor_battle_test_status_mode
  ON tutor_battle_test_statuses (mode);

-- Drop old enum type if it exists
DO $$
BEGIN
  DROP TYPE IF EXISTS tutor_certification_mode_old;
EXCEPTION
  WHEN others THEN NULL;
END $$;
