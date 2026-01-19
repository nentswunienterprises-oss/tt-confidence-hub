# ⚡ Quick Fix - Copy These Exact URLs to Supabase

## 🎯 Your Redirect URLs (Add to Supabase Dashboard)

### Step 1: Go to Supabase Dashboard
🔗 https://app.supabase.com/project/yzcnavucvwgmulcxgxvw/auth/url-configuration

### Step 2: Add These Redirect URLs

Copy and paste these EXACT URLs into the "Redirect URLs" field (one per line):

```
http://localhost:5173/auth/callback
http://localhost:5000/auth/callback
https://your-production-domain.com/auth/callback
```

Replace `your-production-domain.com` with your actual production domain.

### Step 3: Configure Google OAuth in Google Cloud Console

🔗 https://console.cloud.google.com/apis/credentials

Add this EXACT URL to "Authorized redirect URIs":

```
https://yzcnavucvwgmulcxgxvw.supabase.co/auth/v1/callback
```

## 🧪 Test It

1. Run your app: `npm run dev`
2. Go to login page
3. Click "Continue with Google"
4. Sign in with Google
5. You should be redirected back and logged in!

## ❌ Still Not Working?

1. Make sure URLs match EXACTLY (no trailing slashes)
2. Clear browser cache and cookies
3. Check Supabase logs: https://app.supabase.com/project/yzcnavucvwgmulcxgxvw/logs/auth-logs
4. Verify Google OAuth is enabled in Supabase: https://app.supabase.com/project/yzcnavucvwgmulcxgxvw/auth/providers

---

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed troubleshooting.
