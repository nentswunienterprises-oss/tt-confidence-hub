-- Add Encounter Properties columns to encounters table
-- Encounter Properties (affiliate logs each encounter) 
-- 1. Parent Name – Who we spoke to (already exists)
-- 2. Date Met – When the encounter happened
-- 3. Contact Method/Source – Phone, DM, referral, school outreach, etc.
-- 4. Discovery Outcome – The parents' pain points / what they admitted
-- 5. Delivery Notes – How TT's solution was positioned in their world
-- 6. Final Outcome – Enrolled / Objected / Follow Up Needed
-- 7. Result – What's next 
-- 8. Confidence Rating (1–5) – How it made you feel
-- 9. My Thoughts/Reflection – Self-review: "What I did well, what I should adjust"

ALTER TABLE encounters ADD COLUMN IF NOT EXISTS date_met TIMESTAMP;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS contact_method VARCHAR(255);
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS discovery_outcome TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS final_outcome VARCHAR(255);
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS confidence_rating INTEGER;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS my_thoughts TEXT;
