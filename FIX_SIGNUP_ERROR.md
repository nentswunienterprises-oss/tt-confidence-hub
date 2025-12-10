# Fix: "User not allowed" Signup Error

## Problem
Signup is failing with error: `AuthApiError: User not allowed (code: not_admin)`

## Root Cause
Your Supabase project has **email confirmation enabled** in the authentication settings. When this is enabled, self-sign-ups require either:
1. A valid email confirmation flow (SMTP configured), OR
2. The SERVICE_ROLE_KEY to create pre-confirmed users

Since your environment doesn't have the SERVICE_ROLE_KEY configured, signups are failing.

## Solution (Choose One)

### Option 1: Disable Email Confirmation (Recommended for Development)
This is the fastest fix for local development:

1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **Authentication** → **Policies**
3. Find the setting **Confirm email** and toggle it **OFF**
4. Save changes
5. Try signing up again

### Option 2: Add Service Role Key (For Production)
If you need email confirmation:

1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **API** 
3. Copy the **service_role** secret key (keep this private!)
4. Add it to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
5. The backend code is already set up to use it

### Option 3: Configure SMTP (For Email Confirmations)
If you want working email confirmations:

1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **Email** → **SMTP Settings**
3. Configure your SMTP provider (Gmail, SendGrid, etc.)
4. Set up email templates
5. Email confirmations will now work

## Testing
After applying the fix, try signing up as HR again at: `http://localhost:5173/executive/signup`

## Expected Behavior After Fix
✅ Signup should succeed
✅ User should be created with role "hr" (not "tutor")
✅ Login should work and redirect to HR dashboard
✅ Role validation should work on subsequent logins

## Troubleshooting
- If still getting errors, check the backend console logs for more details
- The backup role-assignment code will auto-fix the role if the trigger doesn't
- Session data should now persist correctly after signup
