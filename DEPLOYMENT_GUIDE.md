# Deployment Guide: Split Frontend/Backend

This application uses a split deployment architecture:
- **Frontend**: Deployed on Vercel (Static Vite build)
- **Backend**: Deployed on Railway (Express API server)

## Quick Setup

### 1. Deploy Backend to Railway

1. Connect your GitHub repository to Railway
2. Railway will auto-detect the configuration from `railway.json` and `nixpacks.toml`
3. Add the following environment variables in Railway:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   DATABASE_URL=your_database_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_JWT_SECRET=your_jwt_secret
   SESSION_SECRET=generate_a_random_string
   ```
4. Copy your Railway deployment URL (e.g., `https://your-app.up.railway.app`)

### 2. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Vite and build the frontend
3. Add the following environment variables in Vercel:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Deploy!

### 3. Update Railway with Vercel URL

After your Vercel deployment is live:
1. Go back to Railway
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL
3. Redeploy if needed

## How It Works

### Frontend (Vercel)
- Builds: `npm run build` → Creates static files in `dist/`
- The frontend uses `VITE_API_URL` to connect to Railway backend
- All API requests go to: `${VITE_API_URL}/api/...`

### Backend (Railway)
- Builds: `npm run build:backend` → Compiles Express server
- Starts: `npm start` → Runs the compiled server
- CORS is configured to accept requests from Vercel (`.vercel.app` domains)
- Uses `FRONTEND_URL` for CORS and redirects

## Local Development

For local development, both frontend and backend run together:

```bash
npm run dev
```

This runs:
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:5000` (Express API)

Vite is configured to proxy `/api/*` requests to the backend automatically.

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in Railway
- Check that your Vercel domain ends with `.vercel.app` or is in the allowed origins

### API Connection Issues
- Verify `VITE_API_URL` in Vercel points to your Railway deployment
- Check Railway logs for any startup errors
- Ensure all required environment variables are set

### Build Failures
- **Vercel**: Should only build frontend (`vite build`)
- **Railway**: Should only build backend (`npm run build:backend`)
- Check the respective build logs for specific errors
