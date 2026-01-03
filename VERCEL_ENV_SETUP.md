# Vercel Environment Variables Setup

## Critical: Your backend is failing because these environment variables are missing on Vercel!

Go to your Vercel project settings:
👉 **https://vercel.com/[your-username]/schoolmanagement/settings/environment-variables**

## Required Environment Variables:

### 1. Database Configuration (MUST USE CLOUD DATABASE)
```
DB_HOST=your-planetscale-host.psdb.cloud
DB_USER=your-planetscale-username
DB_PASSWORD=pscale_pw_xxxxxxxxxxxx
DB_NAME=school_management
DB_PORT=3306
```

**⚠️ IMPORTANT:** 
- You CANNOT use localhost on Vercel
- You MUST use a cloud database (PlanetScale, Railway, Aiven, etc.)
- See `DATABASE_SETUP.md` for PlanetScale setup (FREE tier available)

### 2. JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
```

### 3. Environment
```
NODE_ENV=production
```

### 4. Client URL (Optional but recommended)
```
CLIENT_URL=https://schoolmanagement-henna.vercel.app
```

## Quick Setup Steps:

### Step 1: Set up PlanetScale Database (5 minutes)
1. Go to https://planetscale.com/
2. Sign up (free)
3. Create database: `schoolmanagement`
4. Get connection credentials
5. Import `database.sql` via Console

### Step 2: Add Environment Variables to Vercel
1. Go to: https://vercel.com/[your-username]/schoolmanagement/settings/environment-variables
2. Add each variable above
3. Set for: **Production, Preview, and Development**
4. Click "Save"

### Step 3: Redeploy
After adding environment variables:
```bash
# Option 1: Push to trigger auto-deploy
git add .
git commit -m "Fix: Configure backend for Vercel"
git push

# Option 2: Manual redeploy from Vercel dashboard
# Go to Deployments tab and click "Redeploy"
```

## Testing After Deployment:

### 1. Check API Health
Visit: https://schoolmanagement-henna.vercel.app/api/health

Should return:
```json
{
  "status": "OK",
  "message": "School Management System API is running",
  "database": "configured"
}
```

### 2. Test Login
Try logging in with demo credentials (after database is set up):
- Email: `admin@school.com`
- Password: `admin123`

## Troubleshooting:

### If you see "Login failed":
1. ✅ Check environment variables are set
2. ✅ Database is accessible (not localhost)
3. ✅ Database schema is imported
4. ✅ Redeployed after adding env vars

### If you see "Database connection failed":
- Your DB_HOST is likely incorrect or using localhost
- Make sure you're using a cloud database URL
- Check DB credentials are correct

### View Logs:
https://vercel.com/[your-username]/schoolmanagement/logs

## Current Issues:
Based on your login failure, here's what's likely wrong:

❌ **Database:** Not connected or using localhost (won't work on Vercel)
❌ **Environment Variables:** Missing or incorrect on Vercel
❌ **JWT_SECRET:** Not set, causing auth failures

## Next Steps:
1. Set up PlanetScale database (see `DATABASE_SETUP.md`)
2. Add all environment variables to Vercel
3. Redeploy your application
4. Test at /api/health endpoint first
