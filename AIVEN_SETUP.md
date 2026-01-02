# Aiven MySQL Setup Guide (Free Cloud MySQL)

## Step 1: Sign Up for Aiven
1. Go to https://console.aiven.io/signup
2. Sign up with:
   - Email (easiest)
   - OR GitHub
   - OR Google
3. Verify your email

## Step 2: Create MySQL Service
1. After login, click **"Create service"**
2. Select **"MySQL"**
3. Choose **Cloud provider**: Any (AWS, Google Cloud, Azure)
4. Select **Region**: Choose closest to you
5. Select **Service plan**: Click **"Hobbyist - Free"** ✅
   - This is completely FREE
   - 1 GB storage
   - Shared CPU
   - No credit card required
6. Give it a name: `schoolmanagement-db`
7. Click **"Create service"**

## Step 3: Wait for Service to Start
- Status will show "Rebuilding" → "Running" (takes ~5 minutes)
- Wait until status is **"RUNNING"** with green indicator

## Step 4: Get Connection Details
1. Once running, click on your service name
2. Go to **"Overview"** tab
3. Scroll down to **"Connection information"**
4. You'll see:
   ```
   Host: schoolmanagement-db-yourproject.aivencloud.com
   Port: 12345
   User: avnadmin
   Password: [click to reveal]
   Database: defaultdb
   ```

5. **IMPORTANT**: Click "Show password" and copy it immediately!

## Step 5: Import Database Schema

### Option A: Using MySQL Workbench (Recommended)
1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Create new connection:
   - Connection Name: `Aiven School DB`
   - Hostname: (from Aiven)
   - Port: (from Aiven)
   - Username: `avnadmin`
   - Password: (click Store in Keychain and paste)
3. Test connection
4. Open `database.sql` file
5. Execute the script

### Option B: Using Command Line
1. Install MySQL client if not already installed
2. Connect:
```bash
mysql -h <host-from-aiven> -P <port-from-aiven> -u avnadmin -p<password> defaultdb
```
3. Run the SQL file:
```bash
mysql -h <host> -P <port> -u avnadmin -p<password> defaultdb < database.sql
```

### Option C: Using Aiven Console (For Small Scripts)
1. In Aiven console, click on your service
2. Go to "Database" tab
3. You can execute queries here (but may have size limits)

## Step 6: Add Environment Variables to Vercel

Go to: https://vercel.com/rameshsp-gifs-projects/schoolmanagement/settings/environment-variables

Click "Add" and add these for **Production, Preview, and Development**:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `schoolmanagement-db-yourproject.aivencloud.com` |
| `DB_PORT` | `12345` (your port number) |
| `DB_USER` | `avnadmin` |
| `DB_NAME` | `defaultdb` |
| `DB_PASSWORD` | `your-aiven-password` |
| `JWT_SECRET` | `3f7a37a8e9b6da11b328ec44f7efcb54a3198f44b7245c8dc41b1308c118c39b13466f517d570ba1fe636b38f525c3f727db7c97e98733eb1d23eda50e532d5e` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://schoolmanagement-henna.vercel.app` |

## Step 7: Deploy to Vercel
```bash
cd C:\SchoolManagement
vercel --prod
```

## Step 8: Test Your Application
Visit: https://schoolmanagement-henna.vercel.app

## ✅ Aiven Advantages
- ✅ Truly FREE tier (no credit card needed)
- ✅ 1 GB storage
- ✅ Production-ready
- ✅ Automatic backups
- ✅ SSL/TLS enabled by default
- ✅ Monitoring dashboard
- ✅ Multiple cloud providers (AWS, GCP, Azure)

## 📝 Important Notes
- Free tier doesn't expire
- Database is hosted on professional cloud infrastructure
- SSL is REQUIRED (already configured in your code)
- Service auto-sleeps after 30 days of inactivity (can wake up easily)

## 🔧 Troubleshooting
- If service is "Rebuilding", wait a few minutes
- Make sure to copy the password when revealed (it's only shown once)
- Use SSL connection (already configured in your code)
- Check Aiven console logs if connection fails

## 🎯 You're All Set!
Once you complete these steps, your School Management System will be fully deployed with a cloud MySQL database!
