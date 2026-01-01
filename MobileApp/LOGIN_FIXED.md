# ✅ Login Fixed - Quick Start Guide

## 🎉 What Was Fixed:

1. **API URL Configuration** - Automatically detects platform:
   - Android Emulator: `http://10.0.2.2:5000/api`
   - iOS Simulator: `http://localhost:5000/api`
   - Physical Device: Configurable in `src/config/api.config.ts`

2. **Better Error Messages** - Detailed errors help diagnose issues

3. **Test Connection Button** - On login screen to verify backend connectivity

4. **Console Logging** - Detailed logs in Metro bundler

---

## 🚀 How to Test Login NOW:

### Your Expo Server is Running! ✅

Metro is running at: `exp://10.56.29.150:8082`

### Option 1: Android Emulator (Recommended for local testing)

```bash
# In the terminal where Expo is running, press:
a
```

This will:
- Open Android emulator
- Automatically use `http://10.0.2.2:5000/api` to connect to your backend
- Work immediately with backend on `localhost:5000`

### Option 2: Physical Device (Requires IP configuration)

1. **On your device:**
   - Install Expo Go from App Store/Play Store
   - Scan the QR code shown in terminal

2. **Before logging in:**
   - Your computer IP is: `10.56.29.150` (from Metro output)
   - Update `src/config/api.config.ts`:
     ```typescript
     const PHYSICAL_DEVICE_IP = '10.56.29.150';
     ```
   - Uncomment the return line:
     ```typescript
     return `http://${PHYSICAL_DEVICE_IP}:5000/api`;
     ```
   - Save and reload the app (shake device → Reload)

3. **Ensure backend accepts network connections:**
   In your backend, make sure server listens on all interfaces:
   ```javascript
   app.listen(5000, '0.0.0.0', () => {
     console.log('Server running on port 5000');
   });
   ```

---

## 🧪 Test the Login:

1. **App opens** → You see login screen
2. **Check console** → Should show:
   ```
   🌐 API URL: http://10.0.2.2:5000/api (Android) or http://localhost:5000/api (iOS)
   📱 Platform: android/ios
   ```

3. **Tap "Test Connection"** button:
   - ✅ Success = Backend is reachable, login should work
   - ❌ Failed = Check error message, fix the issue

4. **Use Demo Account:**
   - Tap "Admin" chip to auto-fill
   - Or enter: `admin@school.com` / `admin123`
   - Tap "Sign In"

5. **Watch Metro logs** for:
   ```
   Attempting login with email: admin@school.com
   Login successful, navigating to tabs
   ```

---

## ⚠️ Important Notes:

### For Android Emulator:
- **No configuration needed!** ✅
- Uses `10.0.2.2` which maps to your `localhost`
- Backend on `localhost:5000` is automatically accessible

### For iOS Simulator:
- **No configuration needed!** ✅
- Uses `localhost:5000` directly
- Works out of the box

### For Physical Device:
- **Must configure IP address** in `src/config/api.config.ts`
- Both devices must be on **same Wi-Fi network**
- Backend must listen on `0.0.0.0` not just `localhost`
- After changing config, **reload the app** in Expo Go

---

## 📋 Checklist Before Login:

```
✅ Expo server running (you have this!)
✅ Backend running on port 5000
✅ Backend accessible: curl http://localhost:5000/api/health
✅ Using correct API URL for your platform
✅ "Test Connection" button shows success
```

---

## 🐛 If Login Still Fails:

### 1. Press "Test Connection" Button
The error message will tell you exactly what's wrong:
- "Connection OK" = Backend is good, check credentials
- "Network Error" = Backend not reachable, check URL/backend
- "Timeout" = Backend slow or firewall blocking

### 2. Check Metro Bundler Logs
Look for lines like:
```
API Error: {
  url: '/auth/login',
  status: undefined,
  message: 'Network Error'
}
```

### 3. Verify Backend
```bash
# Should return HTTP 200 or 404 (not connection refused)
curl http://localhost:5000/api/health

# OR test login directly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

### 4. Common Fixes

**"Network Error" on Android Emulator:**
```bash
# Restart with cache clear
Press Ctrl+C in Metro terminal
npx expo start -c
Press 'a' for Android
```

**"Cannot connect" on Physical Device:**
1. Check both devices on same Wi-Fi
2. Update IP in `src/config/api.config.ts`
3. Reload app in Expo Go

**Backend running but unreachable:**
```javascript
// Backend must listen on 0.0.0.0 not just localhost
app.listen(5000, '0.0.0.0', () => {
  console.log('✅ Server on port 5000');
});
```

---

## 🎯 Expected Login Flow:

1. Open app → Login screen appears
2. Tap "Test Connection" → "✅ Connection OK"
3. Tap "Admin" chip (or enter credentials)
4. Tap "Sign In"
5. See "Login successful" in Metro logs
6. Dashboard appears with stats

---

## 📱 Metro Bundler Commands:

While Metro is running:
- `a` - Open Android emulator
- `i` - Open iOS simulator
- `r` - Reload app
- `c` - Clear cache
- `Ctrl+C` - Stop server

---

## 📞 Still Need Help?

Check the full troubleshooting guide:
```bash
# Open this file:
TROUBLESHOOTING.md
```

Or check these files:
- `src/config/api.config.ts` - API configuration
- `src/services/api.ts` - API client with logging
- `src/screens/auth/LoginScreen.tsx` - Login logic

---

## ✨ Success Indicators:

When everything works, you'll see:

**In Metro Bundler:**
```
🏫 School Management App Started
🌐 API URL: http://10.0.2.2:5000/api
⏱️  Timeout: 10000 ms
Attempting login with email: admin@school.com
Login successful, navigating to tabs
```

**On Device:**
- Login screen with gradient background
- "Test Connection" shows ✅ success
- Login works and navigates to dashboard
- Dashboard shows statistics cards

---

**Your app is ready to test! Press `a` in the Metro terminal to launch Android emulator.** 🚀
