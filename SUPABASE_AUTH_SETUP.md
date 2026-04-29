# Supabase Authentication Setup Guide

## 🎯 Overview

Your TT Confidence Hub now has a properly configured Supabase authentication system that:
- ✅ Accepts role selection during signup (Tutor or Territory Director)
- ✅ Automatically stores the correct role in the `public.users` table
- ✅ Redirects users to the correct dashboard based on their role
- ✅ Handles both frontend and backend authentication flows

## 🔧 Required Setup Steps

### Step 1: Run the Supabase Trigger SQL

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `supabase_trigger.sql` (located in the root of this project)
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run**

This will create a database trigger that automatically:
- Creates a user in `public.users` whenever someone signs up via Supabase Auth
- Uses the `role` from metadata (defaults to 'tutor' if not provided)
- Uses `first_name` and `last_name` from metadata
- Generates a full name from first_name + last_name

### Step 2: Verify Environment Variables

Make sure you have these secrets configured in your Replit project:

```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SESSION_SECRET=your-session-secret
DATABASE_URL=your-postgres-connection-string
```

You can check/add secrets in the Replit Secrets panel (🔒 icon in left sidebar).

## 📝 How It Works

### Signup Flow

1. **User fills signup form** with:
   - First Name
   - Last Name
   - Email
   - Password
   - **Role selection** (Tutor or Territory Director)

2. **Frontend sends signup request** to Supabase with metadata:
   ```javascript
   supabase.auth.signUp({
     email,
     password,
     options: {
       data: {
         role,
         first_name: firstName,
         last_name: lastName,
       },
     },
   });
   ```

3. **Supabase trigger executes** automatically:
   - Reads `role` from `raw_user_meta_data->>'role'`
   - Inserts user into `public.users` with correct role
   - Creates full name from first/last name

4. **Auto-login after signup**:
   - User is automatically logged in
   - Frontend fetches role from database (with retry logic)
   - Redirects to correct dashboard

### Login Flow

1. **User enters credentials**
2. **Supabase authenticates** the user
3. **Frontend fetches role** from `public.users` table
4. **Redirects based on role**:
   - `tutor` → `/tutor/pod`
   - `td` → `/td/dashboard` (if assigned to pod) or `/td/no-pod`
   - `coo` → `/coo/dashboard`

## 🧪 Testing Instructions

### Test 1: Sign up as Tutor

1. Go to `/auth` page
2. Click **Sign Up** tab
3. Fill in:
   - First Name: `Test`
   - Last Name: `Tutor`
   - Email: `testtutor@example.com`
   - Password: `password123`
   - Role: **Tutor**
4. Click **Sign Up**

**Expected Result:**
- ✅ Success message appears
- ✅ Automatically logged in
- ✅ Redirected to `/tutor/pod`

**Verify in Supabase:**
1. Go to Table Editor → `users`
2. Find user with email `testtutor@example.com`
3. Check `role` column = `'tutor'`

### Test 2: Sign up as Territory Director

1. Log out from current session
2. Go to `/auth` page
3. Click **Sign Up** tab
4. Fill in:
   - First Name: `Test`
   - Last Name: `Director`
   - Email: `testtd@example.com`
   - Password: `password123`
   - Role: **Territory Director (TD)**
5. Click **Sign Up**

**Expected Result:**
- ✅ Success message appears
- ✅ Automatically logged in
- ✅ Redirected to `/td/no-pod` (since no pod assigned)

**Verify in Supabase:**
1. Go to Table Editor → `users`
2. Find user with email `testtd@example.com`
3. Check `role` column = `'td'`

### Test 3: Login with existing account

1. Log out
2. Click **Login** tab
3. Enter credentials from Test 1 or Test 2
4. Click **Login**

**Expected Result:**
- ✅ Redirected to correct dashboard based on role

## 🐛 Troubleshooting

### Issue: User created but role is still 'tutor' when I selected 'td'

**Cause:** The Supabase trigger hasn't been created yet.

**Fix:** 
1. Run the SQL from `supabase_trigger.sql` in Supabase SQL Editor
2. Delete the test user from `auth.users` table
3. Sign up again

### Issue: After signup, redirected to landing page instead of dashboard

**Cause:** The trigger might not have created the user in `public.users` yet.

**Fix:** 
- The frontend now has retry logic (up to 5 attempts with 500ms delay)
- If this still happens, check browser console for error messages
- Verify the trigger exists: Run `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';` in SQL Editor

### Issue: "Invalid credentials" when logging in with account I just created

**Cause:** This was the original bug - user wasn't being created properly.

**Fix:** 
1. Ensure you've run the Supabase trigger SQL
2. Delete old test accounts from `auth.users`
3. Sign up fresh accounts with the fixed code

## 📊 Database Schema

The `public.users` table should have these columns:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,  -- Matches auth.users.id
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR NOT NULL,  -- 'tutor', 'td', or 'coo'
  first_name VARCHAR,
  last_name VARCHAR,
  name VARCHAR,  -- Computed from first_name + last_name
  assignedPodId VARCHAR,  -- For TDs
  profileImageUrl VARCHAR,
  verified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

##   Success Criteria

You'll know everything is working when:

1. ✅ You can sign up as both Tutor and TD
2. ✅ The `role` in `public.users` matches what you selected
3. ✅ Login redirects you to the correct dashboard
4. ✅ No "Invalid credentials" errors for newly created accounts
5. ✅ No 404 errors after authentication

---

**Need help?** Check the browser console and server logs for detailed error messages.
