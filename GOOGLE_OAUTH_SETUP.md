# Google OAuth Configuration Guide

## What Was Fixed

The Google OAuth wasn't working because:
1. ❌ No redirect URL was specified in the OAuth call
2. ❌ No callback route existed to handle the OAuth response
3. ❌ OAuth flow type wasn't specified in Supabase client config

## Changes Made

### 1. Created Auth Callback Handler
- **File**: `client/src/pages/auth-callback.tsx`
- **Purpose**: Processes the OAuth redirect and extracts the session
- **Route**: `/auth/callback`

### 2. Updated Auth Form
- **File**: `client/src/components/auth/auth-form.tsx`
- **Changes**: 
  - Added `redirectTo` option pointing to `/auth/callback`
  - Added OAuth query parameters for better consent flow

### 3. Enhanced Supabase Client
- **File**: `client/src/lib/supabaseClient.ts`
- **Changes**: Added `flowType: 'pkce'` for secure OAuth flow

### 4. Added Callback Route
- **File**: `client/src/App.tsx`
- **Changes**: Added route for `/auth/callback`

## Required Supabase Configuration

You **MUST** configure the redirect URLs in your Supabase dashboard:

### Step 1: Get Your URLs

**Development:**
```
http://localhost:5173/auth/callback
```

**Production** (replace with your actual domain):
```
https://yourdomain.com/auth/callback
```

### Step 2: Configure in Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Find **Redirect URLs** section
5. Add both URLs (one per line):
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```
6. Click **Save**

### Step 3: Verify Google OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Ensure it's **Enabled**
4. Verify you have:
   - ✅ Client ID configured
   - ✅ Client Secret configured
   - ✅ Authorized redirect URIs in Google Console match Supabase callback URL

### Step 4: Google Cloud Console Configuration

Your Google OAuth app must have these authorized redirect URIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```
   
   Replace `<your-supabase-project-id>` with your actual Supabase project ID.

## Testing the Fix

### Development Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to login page
3. Click "Continue with Google"
4. Complete Google sign-in
5. You should be redirected to `/auth/callback` briefly, then to your dashboard

### What to Expect

✅ **Success Flow:**
1. User clicks "Continue with Google"
2. Redirects to Google sign-in
3. User authenticates with Google
4. Redirects back to `/auth/callback`
5. Callback extracts session and role
6. Redirects to appropriate dashboard

❌ **If Still Not Working:**

Check the browser console for errors:
- "OAuth callback error" - check Supabase logs
- "No session found" - verify redirect URLs match exactly
- "No role found" - user metadata not set during signup

## Environment Variables

Ensure you have these set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Common Issues

### Issue: "Invalid redirect URL"
**Solution**: Ensure the redirect URL in Supabase settings matches exactly (including protocol and path)

### Issue: Google sign-in opens but doesn't redirect back
**Solution**: Check Google Cloud Console authorized redirect URIs include your Supabase callback URL

### Issue: Redirects to callback but shows error
**Solution**: Check browser console and Supabase logs for specific error message

### Issue: User has no role after OAuth
**Solution**: Google OAuth doesn't automatically set role. You may need to:
1. Prompt user for role selection after first OAuth sign-in
2. Set default role in Supabase trigger
3. Implement role assignment flow

## Next Steps

After confirming Google OAuth works, consider:

1. **Role Assignment**: Implement logic to assign roles to OAuth users
2. **User Metadata**: Ensure first_name, last_name are populated from Google profile
3. **Error Handling**: Add better error messages for failed OAuth attempts
4. **Email Verification**: Decide if OAuth users need email verification

## Support

If issues persist:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check browser console for client-side errors
3. Verify all redirect URLs match exactly
4. Test with Supabase's built-in auth UI to isolate the issue
