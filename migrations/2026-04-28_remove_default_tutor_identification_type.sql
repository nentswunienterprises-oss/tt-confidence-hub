-- Remove implicit SA ID selection from tutor onboarding records.
-- Identification type must reflect an explicit tutor choice, not a database default.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tutor_applications'
      AND column_name = 'id_type'
  ) THEN
    ALTER TABLE tutor_applications
    ADD COLUMN id_type VARCHAR;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tutor_applications'
      AND column_name = 'id_type'
  ) THEN
    ALTER TABLE tutor_applications
    ALTER COLUMN id_type DROP DEFAULT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tutor_applications'
      AND column_name = 'id_type'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tutor_applications'
      AND column_name = 'id_number'
  ) THEN
    UPDATE tutor_applications
    SET id_type = NULL
    WHERE id_type = 'sa_id'
      AND (
        id_number IS NULL
        OR btrim(id_number) = ''
      );
  END IF;
END $$;

COMMENT ON COLUMN tutor_applications.id_type IS 'Type of identification: sa_id (South African ID) or passport';

CREATE INDEX IF NOT EXISTS idx_tutor_applications_id_type ON tutor_applications(id_type);
