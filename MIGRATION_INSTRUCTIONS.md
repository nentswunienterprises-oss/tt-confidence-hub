# 🔧 Student Portal Database Migration

## The Issue

The student authentication requires database tables that don't exist yet. The migration script needs your Supabase service role key to run.

## Option 1: Run Migration Script (Recommended if you have the key)

1. **Find or create your `.env` file** in the project root
2. **Add this line** (replace with your actual key):
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
3. **Run the migration**:
   ```bash
   node run-student-migration.mjs
   ```

## Option 2: Run SQL Directly in Supabase (Easiest)

If you don't have the service role key handy:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: yzcnavucvwgmulcxgxvw
3. **Click on "SQL Editor"** in the left sidebar
4. **Click "New Query"**
5. **Copy and paste this SQL**:

```sql
-- Add parent_code to onboarding_proposals
ALTER TABLE onboarding_proposals ADD COLUMN IF NOT EXISTS parent_code VARCHAR(8) UNIQUE;

-- Create student_users table for student authentication
CREATE TABLE IF NOT EXISTS student_users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  student_id VARCHAR,
  parent_code VARCHAR(8),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP
);

-- Create index on parent_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_users_parent_code ON student_users(parent_code);
CREATE INDEX IF NOT EXISTS idx_onboarding_proposals_parent_code ON onboarding_proposals(parent_code);
```

6. **Click "Run"** or press `Ctrl+Enter`
7. **Verify success** - you should see "Success. No rows returned"

## Verify Migration Worked

After running either option, verify the tables exist:

**In Supabase SQL Editor, run:**
```sql
-- Check if parent_code column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'onboarding_proposals' AND column_name = 'parent_code';

-- Check if student_users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'student_users';
```

You should see results for both queries. If you do, the migration is successful!

## Then What?

Once the migration is complete:
1. **Restart your dev server**: `npm run dev`
2. **Generate a parent code**: Have a parent accept a proposal
3. **Test student signup**: Navigate to `/student` and create an account with the parent code

---

**Still having issues?** Check the server terminal logs when attempting student signup - they'll show the exact error.
