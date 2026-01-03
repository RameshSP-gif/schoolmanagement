# 🎓 School Management System - E2E Running Guide

## ✅ COMPLETE SETUP - Frontend + Backend + SQLite

Your application is now fully configured for end-to-end operation!

---

## 🚀 Quick Start (Local Development)

### Option 1: Automated Setup
```powershell
.\quick-start.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd c:\SchoolManagement
node server/server.js
```

**Terminal 2 - Frontend:**
```powershell
cd c:\SchoolManagement\client
npm start
```

### ✅ Verify Running:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health
- Database: Auto-created at `./school_management.db`

---

## 🌐 Production Deployment (Vercel)

### ⚠️ CRITICAL: Set Environment Variables

**Go to Vercel Dashboard:**
https://vercel.com/rameshsp-gifs-projects/schoolmanagement/settings/environment-variables

**Add these 3 variables:**

```
JWT_SECRET=school-management-secret-key-2026-production-secure-min-32-chars
JWT_EXPIRE=7d
NODE_ENV=production
```

**IMPORTANT:** Check all three scopes:
- ✅ Production
- ✅ Preview  
- ✅ Development

**Then:** Click "Redeploy" from Deployments tab

---

## 🔗 Your Live URLs

Once environment variables are set:

| Service | URL |
|---------|-----|
| **Main App** | https://schoolmanagement-henna.vercel.app |
| **Login** | https://schoolmanagement-henna.vercel.app/login |
| **API Health** | https://schoolmanagement-henna.vercel.app/api/health |

---

## 👤 Demo Accounts

Test with these pre-configured accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@school.com | admin123 |
| **Teacher** | teacher@school.com | teacher123 |
| **Student** | student@school.com | student123 |
| **Parent** | parent@school.com | parent123 |
| **Staff** | staff@school.com | staff123 |

---

## 🗄️ Database Information

### SQLite Configuration
- **Type:** SQLite (via sql.js)
- **Local Path:** `./school_management.db`
- **Vercel Path:** `/tmp/school_management.db`
- **Auto-Initialize:** ✅ Yes (on first request)
- **Demo Data:** ✅ Automatically populated

### No External Database Needed!
✅ No MySQL/PostgreSQL setup required  
✅ No connection strings  
✅ No external hosting  
✅ Perfect for development and small-scale production  

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Frontend (React)                            │
│  - Port 3000 (dev) / Same domain (prod)     │
│  - Client-side routing                       │
│  - Axios API calls                           │
└────────────────┬────────────────────────────┘
                 │ HTTP Requests
                 ↓
┌─────────────────────────────────────────────┐
│  Backend (Express.js)                        │
│  - Port 5000 (dev) / Serverless (prod)      │
│  - JWT Authentication                        │
│  - RESTful API                               │
└────────────────┬────────────────────────────┘
                 │ SQL Queries
                 ↓
┌─────────────────────────────────────────────┐
│  Database (SQLite via sql.js)                │
│  - school_management.db                      │
│  - Auto-created with schema                  │
│  - 5 demo users + test data                  │
└─────────────────────────────────────────────┘
```

---

## ✨ Features Fully Working E2E

✅ **Authentication**
- Login/Logout
- JWT token management
- Role-based access control

✅ **User Management**
- Students, Teachers, Parents, Staff, Admin
- Profile management
- Role-specific dashboards

✅ **Academic Features**
- Classes and subjects
- Attendance tracking
- Assignments
- Exams and grades
- Fee management

✅ **Communication**
- Announcements
- Messages
- Notifications

---

## 🧪 Testing E2E Flow

### 1. Start Local Development
```powershell
.\quick-start.ps1
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Login as Admin
```
Email: admin@school.com
Password: admin123
```

### 4. Test Features
- ✅ View dashboard
- ✅ Check students list
- ✅ Create announcement
- ✅ View classes
- ✅ Test attendance

### 5. Test API Directly
```powershell
# Health check
Invoke-RestMethod http://localhost:5000/api/health

# Login
$body = @{email='admin@school.com'; password='admin123'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $body -ContentType 'application/json'
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Local environment variables |
| `vercel.json` | Vercel deployment config |
| `server/config/database.js` | SQLite configuration |
| `client/src/services/api.js` | Frontend API client |

---

## 📝 Environment Variables

### Local Development (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=local-development-secret-key-school-management-2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Vercel Production
```env
JWT_SECRET=<your-secret-32-chars>
JWT_EXPIRE=7d
NODE_ENV=production
```

---

## 🐛 Troubleshooting

### Local Issues

**Backend won't start:**
```powershell
npm install
node server/server.js
```

**Frontend won't start:**
```powershell
cd client
npm install
npm start
```

**Database errors:**
```powershell
# Remove old database and restart
Remove-Item school_management.db -ErrorAction SilentlyContinue
node server/server.js
```

### Vercel Issues

**500 Error:**
1. Check environment variables are set
2. Redeploy after adding variables
3. Check Vercel logs

**404 Error:**
1. Ensure latest code is deployed
2. Check vercel.json configuration
3. Verify build completed successfully

**Login Fails:**
1. JWT_SECRET must be set on Vercel
2. Must be at least 32 characters
3. Redeploy required after adding

---

## 📚 Documentation

- [VERCEL_ENV_VARIABLES.md](VERCEL_ENV_VARIABLES.md) - Detailed Vercel setup
- [VERCEL_SQLITE_SETUP.md](VERCEL_SQLITE_SETUP.md) - SQLite on Vercel
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - General deployment
- [README.md](README.md) - Project overview

---

## 🎉 Success Checklist

### Local Development
- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] SQLite database created
- [x] Demo data loaded
- [x] Login works
- [x] API responds

### Vercel Production
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] /api/health returns OK
- [ ] Login page loads
- [ ] Can login with admin account
- [ ] Dashboard loads

---

## 🚀 You're Ready!

Your School Management System is fully configured for E2E operation!

**Local:** Run `.\quick-start.ps1`  
**Production:** Set Vercel environment variables and redeploy

**Need help?** Check the troubleshooting section or documentation files.

**Happy coding! 🎓**
