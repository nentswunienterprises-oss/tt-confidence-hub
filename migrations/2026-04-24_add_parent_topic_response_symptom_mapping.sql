ALTER TABLE parent_enrollments
ADD COLUMN IF NOT EXISTS topic_response_symptoms jsonb,
ADD COLUMN IF NOT EXISTS topic_response_signal_scores jsonb,
ADD COLUMN IF NOT EXISTS topic_recommended_starting_phases jsonb;
