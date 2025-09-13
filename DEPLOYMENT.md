# Deployment Guide for Xeno

## Overview
This project consists of:
- **Frontend**: Next.js app (deploy to Vercel)
- **Backend**: Node.js/Express API (deploy to Railway/Render)
- **Database**: PostgreSQL (cloud provider)

## Step-by-Step Deployment

### 1. Set up Production Database

Choose one of these providers:

#### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)
4. Save it as `DATABASE_URL`

#### Option B: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Save it as `DATABASE_URL`

#### Option C: Railway
1. Go to https://railway.app
2. Create a new project
3. Add PostgreSQL database
4. Copy the connection string

### 2. Deploy Backend

#### Using Railway (Recommended)
1. Push your code to GitHub
2. Go to https://railway.app
3. Connect your GitHub repository
4. Railway will auto-detect your `railway.json` config
5. Add these environment variables in Railway dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   APP_URL=https://your-railway-app.railway.app
   WEBHOOK_SECRET=your_webhook_secret
   NODE_ENV=production
   ```

#### Using Render
1. Push your code to GitHub
2. Go to https://render.com
3. Connect your GitHub repository
4. Render will auto-detect your `render.yaml` config
5. Environment variables are configured in the YAML file

### 3. Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Set the **Root Directory** to `frontend`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
6. Deploy!

### 4. Run Database Migrations

After deploying your backend, run migrations:

```bash
# If using Railway
railway run npx prisma migrate deploy

# If using Render (add to build command)
npx prisma migrate deploy
```

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secret-key
APP_URL=https://your-backend-url.com
WEBHOOK_SECRET=your-webhook-secret
NODE_ENV=production
```

### Frontend (Vercel Environment Variables)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Important Notes

1. **Never use localhost in production** - Always use cloud databases
2. **Use HTTPS URLs** for all production endpoints
3. **Keep secrets secure** - Use environment variables, never commit them
4. **Run migrations** after database setup
5. **Test your deployment** thoroughly

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check if your database allows external connections
- Ensure your database is running and accessible

### CORS Issues
- Make sure your backend allows requests from your frontend domain
- Check your CORS configuration in `backend/src/app.js`

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` points to your deployed backend
- Check if your backend is running and healthy
- Test API endpoints directly
