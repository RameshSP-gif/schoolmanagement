# Vercel Deployment Configuration Guide

## ✅ Deployment Status
Your application has been successfully deployed to Vercel!

- **Frontend & Backend URL**: https://schoolmanagement-henna.vercel.app
- **GitHub Repository**: https://github.com/RameshSP-gif/schoolmanagement.git

## 🔧 Required Environment Variables Setup

To make the backend functional, you need to configure the following environment variables in Vercel:

### Option 1: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/rameshsp-gifs-projects/schoolmanagement/settings/environment-variables
2. Add the following environment variables for **Production**, **Preview**, and **Development**:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `JWT_SECRET` | `3f7a37a8e9b6da11b328ec44f7efcb54a3198f44b7245c8dc41b1308c118c39b13466f517d570ba1fe636b38f525c3f727db7c97e98733eb1d23eda50e532d5e` | JWT signing key (generated) |
| `NODE_ENV` | `production` | Environment mode |
| `CLIENT_URL` | `https://schoolmanagement-henna.vercel.app` | Frontend URL |
| `DB_HOST` | `your-database-host` | Database host address |
| `DB_USER` | `your-database-user` | Database username |
| `DB_PASSWORD` | `your-database-password` | Database password |
| `DB_NAME` | `school_management` | Database name |
| `DB_PORT` | `3306` | Database port |

### Option 2: Using Vercel CLI
Run these commands (you'll be prompted for values):

```bash
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add CLIENT_URL
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add DB_PORT
```

## 🗄️ Database Setup Options

Since Vercel is a serverless platform, you need a remotely accessible MySQL database. Here are some options:

### Option 1: PlanetScale (Free Tier Available)
1. Sign up at https://planetscale.com/
2. Create a new database
3. Get connection credentials
4. Add to Vercel environment variables

### Option 2: Railway (Free Tier Available)
1. Sign up at https://railway.app/
2. Create a new MySQL database
3. Get connection credentials
4. Add to Vercel environment variables

### Option 3: AWS RDS, Azure Database, or Google Cloud SQL
- Use any cloud MySQL database service
- Ensure it's accessible from Vercel's IP ranges

### Option 4: Existing MySQL Server
- Make sure your MySQL server is publicly accessible
- Configure firewall rules to allow Vercel connections
- Use your server's public IP or domain

## 📦 Database Initialization

After setting up your database, initialize it with the schema:

1. Connect to your database using MySQL client
2. Run the SQL script from `database.sql` file
3. This will create all necessary tables and initial data

## 🔄 Redeploy After Configuration

After adding environment variables:

```bash
vercel --prod
```

Or simply push to GitHub (if auto-deployment is enabled).

## 🧪 Testing the Deployment

### Test Backend API:
```bash
curl https://schoolmanagement-henna.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "School Management System API is running"
}
```

### Test Frontend:
Visit https://schoolmanagement-henna.vercel.app in your browser

## 📝 Notes

- The frontend is configured to connect to the same domain for API calls
- All API routes are accessible at `/api/*`
- CORS is configured to allow the frontend URL
- Database connections are pooled for efficiency in serverless environment

## 🐛 Troubleshooting

If you encounter issues:

1. Check Vercel logs: https://vercel.com/rameshsp-gifs-projects/schoolmanagement/deployments
2. Verify all environment variables are set correctly
3. Ensure database is accessible from external connections
4. Check database credentials and connection details

## 🔐 Security Recommendations

1. ✅ Use strong passwords for database
2. ✅ Keep JWT_SECRET secure and never commit to Git
3. ✅ Use environment variables for all sensitive data
4. ✅ Enable SSL for database connections
5. ✅ Regularly rotate credentials
