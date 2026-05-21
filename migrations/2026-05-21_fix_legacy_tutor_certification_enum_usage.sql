DO $$
BEGIN
  ALTER TYPE tutor_certification_mode ADD VALUE IF NOT EXISTS 'applicant';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tutor_battle_test_statuses'
      AND column_name = 'mode'
      AND udt_name = 'tutor_certification_mode_old'
  ) THEN
    ALTER TABLE tutor_battle_test_statuses
      ALTER COLUMN mode TYPE tutor_certification_mode
      USING mode::text::tutor_certification_mode;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tutor_portable_certification_snapshots'
      AND column_name = 'mode'
      AND udt_name = 'tutor_certification_mode_old'
  ) THEN
    ALTER TABLE tutor_portable_certification_snapshots
      ALTER COLUMN mode TYPE tutor_certification_mode
      USING mode::text::tutor_certification_mode;
  END IF;
END $$;

DO $$
BEGIN
  DROP TYPE IF EXISTS tutor_certification_mode_old;
EXCEPTION
  WHEN dependent_objects_still_exist THEN NULL;
END $$;
