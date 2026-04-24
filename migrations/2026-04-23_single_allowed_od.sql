-- Allow only one active OD account, and only from the approved OD email candidates.
-- Dev OD: kring@gmail.com
-- Future production OD: admin@territorialtutoring.co.za

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM users
    WHERE role = 'od'
      AND lower(email) <> 'kring@gmail.com'
  ) THEN
    UPDATE users
    SET
      role = 'od',
      first_name = COALESCE(NULLIF(first_name, ''), 'Kring'),
      last_name = COALESCE(NULLIF(last_name, ''), 'Ting'),
      name = COALESCE(NULLIF(name, ''), 'Kring Ting'),
      updated_at = NOW()
    WHERE lower(email) = 'kring@gmail.com';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM users
    WHERE role = 'od'
      AND lower(email) NOT IN ('kring@gmail.com', 'admin@territorialtutoring.co.za')
  ) THEN
    RAISE EXCEPTION 'Unauthorized OD account exists. Demote it before applying this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_single_od_idx
ON users (role)
WHERE role = 'od';

CREATE OR REPLACE FUNCTION enforce_allowed_single_od()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'od'
     AND lower(NEW.email) NOT IN ('kring@gmail.com', 'admin@territorialtutoring.co.za') THEN
    RAISE EXCEPTION 'Only approved OD emails can hold the OD role';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_allowed_single_od_trigger ON users;

CREATE TRIGGER users_allowed_single_od_trigger
BEFORE INSERT OR UPDATE OF role, email ON users
FOR EACH ROW
EXECUTE FUNCTION enforce_allowed_single_od();
