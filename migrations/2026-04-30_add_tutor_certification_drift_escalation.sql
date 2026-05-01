ALTER TABLE tutor_battle_test_deep_dive_progress
ADD COLUMN IF NOT EXISTS consecutive_drift_count integer NOT NULL DEFAULT 0;
