ALTER TABLE parent_enrollments
ADD COLUMN IF NOT EXISTS response_symptoms jsonb,
ADD COLUMN IF NOT EXISTS response_signal_scores jsonb,
ADD COLUMN IF NOT EXISTS recommended_starting_phase varchar;
