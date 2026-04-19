ALTER TABLE tutor_onboarding_acceptances
  ADD COLUMN IF NOT EXISTS form_snapshot_json jsonb;
