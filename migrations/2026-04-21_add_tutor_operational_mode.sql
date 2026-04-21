DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'tutor_operational_mode'
  ) THEN
    CREATE TYPE tutor_operational_mode AS ENUM ('training', 'certified_live');
  END IF;
END
$$;

ALTER TABLE tutor_assignments
ADD COLUMN IF NOT EXISTS operational_mode tutor_operational_mode NOT NULL DEFAULT 'training';
