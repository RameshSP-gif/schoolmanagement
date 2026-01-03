# ⚙️ Vercel Environment Variables Setup

## 🔴 CRITICAL: Required for Deployment

Your application **WILL NOT WORK** on Vercel without these environment variables!

---

## 📋 Step-by-Step Setup

### 1. Go to Vercel Dashboard

Open: **https://vercel.com**

Navigate to:
```
Your Project → Settings → Environment Variables
```

Or direct link:
```
https://vercel.com/rameshsp-gifs-projects/schoolmanagement/settings/environment-variables
```

### 2. Add These 3 Variables

Click **"Add New"** for each:

#### Variable 1: JWT_SECRET
```
Name:  JWT_SECRET
Value: school-management-secret-key-2026-production-secure-min-32-chars
```

#### Variable 2: JWT_EXPIRE
```
Name:  JWT_EXPIRE
Value: 7d
```

#### Variable 3: NODE_ENV
```
Name:  NODE_ENV
Value: production
```

### 3. Set Environment Scope

For EACH variable, check:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Save

Click **"Save"** after adding all variables.

### 5. Redeploy

Go to: **Deployments** tab

Find the latest deployment → Click **"︙"** menu → **"Redeploy"**

---

## ✅ Verify Setup

After redeployment (2-3 minutes):

### Test Health Endpoint
```
https://schoolmanagement-henna.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "School Management System API is running",
  "database": "configured"
}
```

### Test Login
```
https://schoolmanagement-henna.vercel.app/login
```

**Demo Credentials:**
- Email: `admin@school.com`
- Password: `admin123`

---

## 🔧 Configuration Summary

| Variable | Value | Purpose |
|----------|-------|---------|
| `JWT_SECRET` | Your secret key | JWT token encryption |
| `JWT_EXPIRE` | `7d` | Token expiration time |
| `NODE_ENV` | `production` | Environment mode |

**Note:** No database configuration needed - SQLite auto-creates!

---

## 🐛 Troubleshooting

### Still getting 500 errors?
1. Check all 3 variables are added
2. Verify scope includes "Production"
3. Redeploy after adding variables
4. Clear browser cache

### Login fails?
1. JWT_SECRET must be set
2. Must be at least 32 characters
3. Redeploy required after adding

### API not found (404)?
1. Check deployment completed successfully
2. Visit /api/health to test
3. Check Vercel logs for errors

---

## 📚 Complete Application URLs

Once configured:

| Service | URL |
|---------|-----|
| **Main App** | https://schoolmanagement-henna.vercel.app |
| **Login** | https://schoolmanagement-henna.vercel.app/login |
| **API** | https://schoolmanagement-henna.vercel.app/api |
| **Health Check** | https://schoolmanagement-henna.vercel.app/api/health |

---

## ✨ What Happens After Setup

✅ SQLite database auto-creates on first request  
✅ Demo data automatically populated  
✅ All 5 demo accounts ready to use  
✅ Full E2E functionality (Frontend ↔ Backend ↔ Database)  

**Your application will be fully functional!** 🎉
