# Quick Deployment Checklist

## ✅ Railway (Backend)

### Environment Variables:
- [ ] `FRONTEND_URL` = Your Vercel URL
- [ ] `DATABASE_URL` = Database connection string  
- [ ] `SUPABASE_URL` = Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Service role key
- [ ] `SUPABASE_JWT_SECRET` = JWT secret
- [ ] `SESSION_SECRET` = Random string

### Settings:
- Build Command: `npm run build:backend` ✓ (configured in railway.json)
- Start Command: `npm start` ✓ (configured in railway.json)

## ✅ Vercel (Frontend)

### Environment Variables:
- [ ] `VITE_API_URL` = Your Railway backend URL (e.g., https://your-app.up.railway.app)
- [ ] `VITE_SUPABASE_URL` = Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` = Supabase anon key

### Settings:
- Build Command: Auto-detected (`vite build`) ✓
- Output Directory: `dist` ✓
- Framework: Vite (auto-detected) ✓

## 🔄 Deployment Order

1. **Deploy Backend First** (Railway)
   - Get Railway URL after deployment
   
2. **Configure Frontend** (Vercel)
   - Add `VITE_API_URL` with Railway URL
   - Deploy frontend
   
3. **Update Backend** (Railway)  
   - Update `FRONTEND_URL` with Vercel URL
   - Redeploy if necessary

## 🧪 Test Connection

After both are deployed, test the connection:
1. Open your Vercel frontend URL
2. Try logging in
3. Check browser console for any CORS or API errors
4. Check Railway logs for incoming requests

## 🔍 Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Verify FRONTEND_URL in Railway matches Vercel URL |
| API 404 errors | Check VITE_API_URL in Vercel is correct |
| Build failures (Vercel) | Ensure it's only building frontend |
| Build failures (Railway) | Check all env vars are set |
