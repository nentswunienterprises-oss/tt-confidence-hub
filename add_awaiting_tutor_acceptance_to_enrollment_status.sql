-- Migration: Add 'awaiting_tutor_acceptance' to enrollment_status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'enrollment_status' AND e.enumlabel = 'awaiting_tutor_acceptance'
  ) THEN
    ALTER TYPE enrollment_status ADD VALUE 'awaiting_tutor_acceptance' BEFORE 'assigned';
  END IF;
END$$;
