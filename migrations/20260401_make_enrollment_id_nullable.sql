-- Migration: Make enrollment_id nullable in onboarding_proposals
ALTER TABLE onboarding_proposals
  ALTER COLUMN enrollment_id DROP NOT NULL;
