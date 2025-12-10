-- ============================================
-- DISABLE TRIGGER (to fix signup issues)
-- ============================================

-- Drop the problematic trigger that's causing signup to fail
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- The trigger function will still exist but won't be called
-- This allows signups to work, and we'll manually create user records in the backend

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this script
-- 4. Click "Run" to execute
-- 5. Go back to your app and try signup again
-- ============================================
