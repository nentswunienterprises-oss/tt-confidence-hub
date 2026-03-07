-- Allow affiliate_id to be NULL for organic leads
ALTER TABLE leads ALTER COLUMN affiliate_id DROP NOT NULL;
-- Update foreign key to allow NULLs (Postgres does this automatically for FK constraints)
-- No further action needed unless ON DELETE/UPDATE rules are strict.
