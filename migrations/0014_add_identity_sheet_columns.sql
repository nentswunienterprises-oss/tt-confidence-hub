-- Add identity sheet columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS personal_profile JSONB,
ADD COLUMN IF NOT EXISTS emotional_insights JSONB,
ADD COLUMN IF NOT EXISTS academic_diagnosis JSONB,
ADD COLUMN IF NOT EXISTS identity_sheet JSONB,
ADD COLUMN IF NOT EXISTS identity_sheet_completed_at TIMESTAMP;
