-- Migration: Add coaching reflection fields to encounters table
-- Date: 2026-01-26
-- Purpose: Track coaching insights for sales and self-awareness

ALTER TABLE encounters 
ADD COLUMN IF NOT EXISTS where_flinched TEXT,
ADD COLUMN IF NOT EXISTS where_talked_too_much TEXT,
ADD COLUMN IF NOT EXISTS where_avoided_tension TEXT;

-- Create index for searching reflection data
CREATE INDEX IF NOT EXISTS idx_encounters_coaching_reflections ON encounters(where_flinched, where_talked_too_much, where_avoided_tension);

-- Add comments for documentation
COMMENT ON COLUMN encounters.where_flinched IS 'Where did the prospect show resistance or hesitation?';
COMMENT ON COLUMN encounters.where_talked_too_much IS 'Where did the affiliate dominate the conversation instead of listening?';
COMMENT ON COLUMN encounters.where_avoided_tension IS 'Where did the affiliate sidestep difficult topics instead of addressing them?';
