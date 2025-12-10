-- Migration: Add new roles to support 4-portal architecture
-- Date: 2025-11-17
-- Description: Expands role enum from [tutor, td, coo] to [parent, student, tutor, td, affiliate, od, coo, hr, ceo]

-- Step 1: Create new enum type with all roles
CREATE TYPE role_new AS ENUM (
  'parent',
  'student',
  'tutor',
  'td',
  'affiliate',
  'od',
  'coo',
  'hr',
  'ceo'
);

-- Step 2: Alter the users table to temporarily use text for role column
ALTER TABLE users 
ALTER COLUMN role SET DATA TYPE text USING role::text;

-- Step 3: Drop the old enum type
DROP TYPE role;

-- Step 4: Create the new enum and rename it
ALTER TYPE role_new RENAME TO role;

-- Step 5: Alter the users table back to use the new role enum
ALTER TABLE users 
ALTER COLUMN role SET DATA TYPE role USING role::role;

-- Step 6: Add default constraint back if needed
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'tutor';

-- Optional: Update any broadcasts table if it uses role enum
-- ALTER TABLE broadcasts 
-- ALTER COLUMN sender_role SET DATA TYPE text USING sender_role::text;
-- (repeat steps 2-5 for broadcasts.sender_role)

-- Verification queries:
-- SELECT 'role enum values:', enum_range(NULL::role);
-- SELECT DISTINCT role FROM users;
-- SELECT DISTINCT sender_role FROM broadcasts;
