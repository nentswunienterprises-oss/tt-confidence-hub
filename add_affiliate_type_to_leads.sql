-- Add affiliate_type and affiliate_name to leads table
ALTER TABLE leads
ADD COLUMN affiliate_type TEXT,
ADD COLUMN affiliate_name TEXT;
