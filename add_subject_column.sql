-- Add subject column to broadcasts table if it doesn't exist
ALTER TABLE "broadcasts" ADD COLUMN IF NOT EXISTS "subject" varchar;

-- Set default value for existing broadcasts
UPDATE "broadcasts" SET "subject" = '(No Subject)' WHERE "subject" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "broadcasts" ALTER COLUMN "subject" SET NOT NULL;
