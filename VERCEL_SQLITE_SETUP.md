# Vercel Environment Variables - REQUIRED

## ⚡ Quick Setup (2 minutes)

Your backend is now using **SQLite** - no external database needed!

### Step 1: Add ONLY These Environment Variables to Vercel

Go to: https://vercel.com/your-username/schoolmanagement/settings/environment-variables

**Add these 3 variables:**

```
JWT_SECRET=your-super-secret-key-at-least-32-characters-long-123456
JWT_EXPIRE=7d
NODE_ENV=production
```

That's it! No database credentials needed. ✨

### Step 2: Deploy

```bash
git push
```

Vercel will auto-deploy in ~2 minutes.

### Step 3: Test

Visit: https://schoolmanagement-henna.vercel.app/api/health

**Demo Login Credentials:**
- Admin: `admin@school.com` / `admin123`
- Teacher: `teacher@school.com` / `teacher123`
- Student: `student@school.com` / `student123`
- Parent: `parent@school.com` / `parent123`

## How It Works

- ✅ SQLite database automatically created on first request
- ✅ Demo data automatically populated
- ✅ Database stored in `/tmp` on Vercel (persists during function lifecycle)
- ✅ No external database setup required
- ✅ Perfect for development and small-scale production

## Note on Data Persistence

⚠️ **Important:** Vercel serverless functions use `/tmp` storage which is ephemeral. Data persists during the function lifecycle but may reset on:
- New deployments
- Function cold starts after inactivity
- Function instance recycling

**For production with permanent data**, consider:
- Turso (SQLite for serverless - FREE tier)
- PlanetScale (MySQL)
- Supabase (PostgreSQL)

But for testing and development, this SQLite setup works perfectly!

## Troubleshooting

### If login fails:
1. Check JWT_SECRET is set in Vercel
2. Check /api/health returns status: "OK"
3. View logs: https://vercel.com/your-username/schoolmanagement/logs

### If API doesn't respond:
- Database initializes on first request (may take 2-3 seconds)
- Check Vercel function logs for errors
