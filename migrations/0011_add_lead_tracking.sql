-- Migration: Add tracking fields to leads table
-- Date: 2026-01-26
-- Purpose: Track how leads were acquired (affiliate, blog, school, media, organic)

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS tracking_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS tracking_campaign VARCHAR(255);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_leads_tracking_source ON leads(tracking_source);
CREATE INDEX IF NOT EXISTS idx_leads_tracking_campaign ON leads(tracking_campaign);
CREATE INDEX IF NOT EXISTS idx_leads_affiliate_source ON leads(affiliate_id, tracking_source);

-- Add comment for documentation
COMMENT ON COLUMN leads.tracking_source IS 'How the lead was acquired: affiliate, blog, school, media, organic, etc.';
COMMENT ON COLUMN leads.tracking_campaign IS 'Campaign identifier for analytics (e.g., math_anxiety, pinewood_academy)';
