# Vercel + Railway Deployment Guide

## Overview
- **Frontend (Next.js)**: Deploy to Vercel
- **Backend (Node.js/Express)**: Deploy to Railway
- **Database (PostgreSQL)**: Railway PostgreSQL service

## Step 1: Deploy Backend to Railway

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 1.2 Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your Xeno repository

### 1.3 Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service

### 1.4 Configure Environment Variables
In your Railway project, go to Variables tab and add:

```env
DATABASE_URL=postgresql://postgres:password@host:port/railway
JWT_SECRET=your-super-secret-jwt-key-here
APP_URL=https://your-app-name.railway.app
WEBHOOK_SECRET=your-webhook-secret-here
NODE_ENV=production
```

**Important**: Replace `your-app-name` with your actual Railway app name.

### 1.5 Deploy
Railway will automatically:
- Use Nixpacks builder (configured in `nixpacks.toml`)
- Install Node.js (npm comes bundled)
- Install dependencies in backend directory
- Run `npx prisma generate`
- Run `npx prisma migrate deploy`
- Start your backend server

**Note**: The `nixpacks.toml` file configures the build process, and `.railwayignore` ensures only backend files are deployed.

Your backend will be available at: `https://your-app-name.railway.app`

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend
The frontend is already configured with `vercel.json`.

### 2.2 Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your Xeno repository
5. **Important**: Set Root Directory to `frontend`
6. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
   ```
7. Click "Deploy"

Your frontend will be available at: `https://your-project-name.vercel.app`

## Step 3: Test Your Deployment

### 3.1 Test Backend
Visit: `https://your-app-name.railway.app/health`
Should return: `{"ok": true}`

### 3.2 Test Frontend
Visit: `https://your-project-name.vercel.app`
Should load your dashboard

### 3.3 Test API Connection
Open browser dev tools and check if API calls are working.

## Environment Variables Summary

### Railway (Backend)
```env
DATABASE_URL=postgresql://postgres:password@host:port/railway
JWT_SECRET=your-super-secret-jwt-key-here
APP_URL=https://your-app-name.railway.app
WEBHOOK_SECRET=your-webhook-secret-here
NODE_ENV=production
FRONTEND_ORIGIN=https://your-project-name.vercel.app
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
```

## Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Docker Build Errors
If you see "npm: command not found" or "The executable `cd` could not be found":
1. Railway should automatically use Nixpacks (configured in `nixpacks.toml`)
2. If it still fails, go to Railway dashboard → Settings → Build
3. **Disable Docker**: Uncheck "Use Dockerfile" option
4. Set Build Command to: `cd backend && npm install && npx prisma generate`
5. Set Start Command to: `cd backend && npx prisma migrate deploy && npm start`

### Force Nixpacks Usage
If Railway keeps trying to use Docker:
1. **All Docker files removed** - Dockerfile and .dockerignore files have been removed
2. Railway will now use Nixpacks automatically with `nixpacks.toml`
3. If it still fails, go to Railway dashboard → Settings → Build
4. **Uncheck "Use Dockerfile"** (should be grayed out now)

**Note**: All Docker-related files have been removed to force Railway to use Nixpacks instead.

### Frontend Issues
- Check Vercel deployment logs
- Verify NEXT_PUBLIC_API_URL points to your Railway backend
- Check browser console for API errors

### Database Issues
- Verify PostgreSQL service is running in Railway
- Check if migrations ran successfully
- Test database connection

## Cost
- **Railway**: Free tier includes $5 credit monthly
- **Vercel**: Free tier for personal projects
- **Total**: Essentially free for small projects

## Next Steps
1. Set up custom domains (optional)
2. Configure monitoring
3. Set up CI/CD for automatic deployments
