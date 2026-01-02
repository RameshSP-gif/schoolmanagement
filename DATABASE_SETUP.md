# PlanetScale Database Setup for School Management System

## Step 1: Create PlanetScale Account
1. Go to https://planetscale.com/
2. Sign up for a free account (you can use GitHub login)
3. Verify your email

## Step 2: Create a New Database
1. Click "Create a new database"
2. Database name: `schoolmanagement` (or any name you prefer)
3. Region: Choose closest to your location
4. Plan: Select "Hobby" (Free tier)
5. Click "Create database"

## Step 3: Get Connection Credentials
1. In your database dashboard, click "Connect"
2. Select "Connect with" → **Node.js**
3. Click "New password" to generate credentials
4. You'll see something like this:

```javascript
host: 'aws.connect.psdb.cloud'
username: 'xxxxxxxxxxxxxx'
password: 'pscale_pw_xxxxxxxxxxxxxx'
```

**IMPORTANT**: Copy these credentials immediately as the password won't be shown again!

## Step 4: Initialize Database Schema

### Option A: Using PlanetScale Console
1. Go to your database in PlanetScale
2. Click on "Console" tab
3. Copy and paste the contents of `database.sql` file
4. Execute the SQL

### Option B: Using MySQL Client
1. Install MySQL client if you don't have it
2. Connect using the credentials:
```bash
mysql -h aws.connect.psdb.cloud -u <username> -p<password> --ssl-mode=REQUIRED
```
3. Run the database.sql file

## Step 5: Configure Vercel Environment Variables

Now add these environment variables to Vercel:

### Via Vercel Dashboard:
Go to: https://vercel.com/rameshsp-gifs-projects/schoolmanagement/settings/environment-variables

Add these variables for **Production**:

| Variable | Value Example |
|----------|---------------|
| `DB_HOST` | `aws.connect.psdb.cloud` |
| `DB_USER` | `xxxxxxxxxxxxxx` |
| `DB_PASSWORD` | `pscale_pw_xxxxxxxxxxxxxx` |
| `DB_NAME` | `schoolmanagement` |
| `DB_PORT` | `3306` |
| `JWT_SECRET` | `3f7a37a8e9b6da11b328ec44f7efcb54a3198f44b7245c8dc41b1308c118c39b13466f517d570ba1fe636b38f525c3f727db7c97e98733eb1d23eda50e532d5e` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://schoolmanagement-henna.vercel.app` |

### Via Vercel CLI (Alternative):
```bash
# You'll be prompted to enter the value for each
vercel env add DB_HOST production
vercel env add DB_USER production
vercel env add DB_PASSWORD production
vercel env add DB_NAME production
vercel env add DB_PORT production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
vercel env add CLIENT_URL production
```

## Step 6: Update Database Configuration

Since PlanetScale uses SSL, we need to update the database configuration.

The `server/config/database.js` should include SSL settings. If not already present, it will work with PlanetScale's default settings.

## Step 7: Deploy
After adding all environment variables:

```bash
vercel --prod
```

Or push to GitHub to trigger auto-deployment.

## Step 8: Test the Connection

Test the API health endpoint:
```bash
curl https://schoolmanagement-henna.vercel.app/api/health
```

Try to register a user:
```bash
curl -X POST https://schoolmanagement-henna.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'
```

## 🎯 Quick Setup Checklist
- [ ] Created PlanetScale account
- [ ] Created database
- [ ] Generated connection password
- [ ] Copied credentials
- [ ] Initialized database schema
- [ ] Added all environment variables to Vercel
- [ ] Redeployed application
- [ ] Tested API endpoints

## 💡 PlanetScale Benefits
- ✅ Free tier (5GB storage, 1 billion row reads/month)
- ✅ Automatic backups
- ✅ Built-in SSL
- ✅ Branch-based development
- ✅ No server maintenance
- ✅ Global edge network

## 🔄 Alternative: Railway.app

If you prefer Railway instead:

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Provision MySQL"
4. Get credentials from "Variables" tab
5. Add to Vercel (same process as above)

Railway provides:
- 500 hours/month free
- $5 credit monthly
- Simple setup

Choose whichever you prefer!
