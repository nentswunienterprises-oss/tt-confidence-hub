-- Migration: Add location column to users table
-- Date: 2026-01-26
-- Purpose: Store user location/city for analytics and lead tracking

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- Add comment for documentation
COMMENT ON COLUMN users.location IS 'User city or location, e.g., San Francisco, CA';
