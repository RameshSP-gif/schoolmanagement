# Railway Database Setup (FREE Alternative)

## Why Railway?
- ✅ **Free tier**: $5 credit/month (enough for small projects)
- ✅ MySQL support (no code changes needed)
- ✅ Super easy setup (2 minutes)
- ✅ Automatic backups
- ✅ No credit card required initially

## Step-by-Step Setup

### 1. Create Railway Account
1. Go to https://railway.app/
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your GitHub

### 2. Create MySQL Database
1. Click "New Project"
2. Select "Provision MySQL"
3. Wait ~30 seconds for database to provision
4. Database is ready!

### 3. Get Connection Details
1. Click on the MySQL service
2. Go to "Variables" tab
3. You'll see these variables:

```
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLPORT=6379
MYSQLUSER=root
MYSQLDATABASE=railway
MYSQLPASSWORD=xxxxxxxxxx
```

**Or use the connection string:**
```
mysql://root:password@host:port/railway
```

### 4. Add to Vercel Environment Variables

Go to: https://vercel.com/rameshsp-gifs-projects/schoolmanagement/settings/environment-variables

Add these for **Production, Preview, and Development**:

| Variable | Value (from Railway) |
|----------|---------------------|
| `DB_HOST` | Copy from `MYSQLHOST` |
| `DB_PORT` | Copy from `MYSQLPORT` |
| `DB_USER` | Copy from `MYSQLUSER` |
| `DB_NAME` | Copy from `MYSQLDATABASE` |
| `DB_PASSWORD` | Copy from `MYSQLPASSWORD` |
| `JWT_SECRET` | `3f7a37a8e9b6da11b328ec44f7efcb54a3198f44b7245c8dc41b1308c118c39b13466f517d570ba1fe636b38f525c3f727db7c97e98733eb1d23eda50e532d5e` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://schoolmanagement-henna.vercel.app` |

### 5. Initialize Database Schema

#### Option A: Using Railway Query Tab
1. In Railway, click on your MySQL service
2. Click "Query" tab at the top
3. Copy the entire contents of your `database.sql` file
4. Paste and click "Execute"

#### Option B: Using MySQL Workbench
1. Download MySQL Workbench
2. Create new connection with Railway credentials
3. Open `database.sql` file
4. Execute the script

#### Option C: Using Command Line
```bash
# Install MySQL client first if you don't have it
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database.sql
```

### 6. Deploy to Vercel
```bash
cd C:\SchoolManagement
vercel --prod
```

### 7. Test Your Application
Visit: https://schoolmanagement-henna.vercel.app

Try to login or register!

## 💡 Railway Tips
- Free $5 credit renews monthly
- Monitor usage in Railway dashboard
- Database persists even if you redeploy
- Easy to upgrade if needed

---

# Alternative: Aiven (Also FREE)

If Railway doesn't work, try Aiven:

## Aiven Setup
1. Go to https://aiven.io/
2. Sign up (no credit card for free tier)
3. Create new service → MySQL
4. Select "Free plan" (1GB storage)
5. Choose region closest to you
6. Get credentials from "Overview" page
7. Add to Vercel (same process as Railway)

---

# Alternative: FreeSQLDatabase (100% Free, No Limits)

## FreeSQLDatabase Setup
1. Go to https://www.freesqldatabase.com/
2. Sign up for free account
3. Create new database
4. Get credentials from dashboard
5. Note: 
   - 5MB storage limit
   - Good for testing/demo
   - No credit card needed

---

# Comparison

| Service | Free Tier | Storage | Time Limit | Best For |
|---------|-----------|---------|------------|----------|
| **Railway** | $5/month credit | 1GB+ | Unlimited | Production |
| **Aiven** | Free forever | 1GB | Unlimited | Production |
| **FreeSQLDatabase** | Free forever | 5MB | Unlimited | Testing only |

## Recommendation: Use Railway 🚂

Railway is the easiest and most reliable option for this project.
