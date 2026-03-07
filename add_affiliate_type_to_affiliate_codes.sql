-- Migration: Add affiliate_type column to affiliate_codes table
ALTER TABLE affiliate_codes
ADD COLUMN affiliate_type TEXT;

-- Optional: Update existing codes with affiliate_type
-- Example:
-- UPDATE affiliate_codes SET affiliate_type = 'person' WHERE code = 'AFIXXRBMHD';
-- UPDATE affiliate_codes SET affiliate_type = 'entity' WHERE code = 'XYZ123';

-- You can set affiliate_type for each code as needed.
