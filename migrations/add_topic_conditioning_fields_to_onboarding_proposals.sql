ALTER TABLE onboarding_proposals
ADD COLUMN IF NOT EXISTS topic_conditioning_topic text,
ADD COLUMN IF NOT EXISTS topic_conditioning_entry_phase varchar,
ADD COLUMN IF NOT EXISTS topic_conditioning_stability varchar;