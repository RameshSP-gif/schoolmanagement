# 🔧 Login Troubleshooting Guide

## Problem: Login not working from Expo app

### ✅ Fixes Applied:

1. **API URL Configuration** - Updated to handle different platforms:
   - Android Emulator: `http://10.0.2.2:5000/api`
   - iOS Simulator: `http://localhost:5000/api`
   - Physical Device: Use your computer's IP address

2. **Better Error Handling** - Added detailed error messages
3. **Connection Test Button** - Added "Test Connection" button on login screen
4. **Console Logging** - Added debugging logs

---

## 🚀 Quick Fix Steps:

### For Android Emulator:
The app is now configured to use `10.0.2.2` which maps to your host machine's `localhost`.

**No changes needed** - just restart the app!

```bash
# In the MobileApp folder:
npm start
```

Press `a` to open Android emulator.

---

### For iOS Simulator:
Already configured for `localhost`.

```bash
npm start
```

Press `i` to open iOS simulator.

---

### For Physical Device:

1. **Find your computer's IP address:**

   **Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

   **Mac/Linux:**
   ```bash
   ifconfig
   # or
   ip addr show
   ```

2. **Update the API config:**

   Open: `src/config/api.config.ts`

   Find this line:
   ```typescript
   const PHYSICAL_DEVICE_IP = '192.168.1.100'; // Change this!
   ```

   Change it to your IP address.

   Then uncomment this line:
   ```typescript
   // return `http://${PHYSICAL_DEVICE_IP}:5000/api`;
   ```

   So it becomes:
   ```typescript
   return `http://${PHYSICAL_DEVICE_IP}:5000/api`;
   ```

3. **Ensure your backend allows connections from your network:**

   If your backend is only listening on localhost, change it to listen on all interfaces:

   In your backend server configuration:
   ```javascript
   app.listen(5000, '0.0.0.0', () => {
     console.log('Server running on port 5000');
   });
   ```

4. **Make sure your phone and computer are on the same Wi-Fi network!**

---

## 🧪 Test the Connection:

1. Open the app
2. On the login screen, tap **"Test Connection"** button
3. You'll see either:
   - ✅ "Connection OK" - Backend is reachable
   - ❌ "Connection Failed" - Check the error details

---

## 🐛 Common Issues & Solutions:

### Issue 1: "Network Error" or "Cannot connect"

**Solutions:**
- ✅ Verify backend is running: `curl http://localhost:5000/api/health`
- ✅ Check firewall isn't blocking port 5000
- ✅ For physical device, verify you're using the correct IP
- ✅ Ensure both devices are on same Wi-Fi network

### Issue 2: "Connection timeout"

**Solutions:**
- ✅ Backend might be slow to respond - check backend logs
- ✅ Increase timeout in `src/config/api.config.ts`
- ✅ Check backend health endpoint exists

### Issue 3: "Invalid credentials" (connection works but login fails)

**Solutions:**
- ✅ Verify the demo account exists in your database
- ✅ Check backend `/auth/login` endpoint
- ✅ Check backend logs for authentication errors
- ✅ Verify password hashing matches

### Issue 4: Android emulator specific

**Solutions:**
- ✅ Make sure using `10.0.2.2` not `localhost`
- ✅ Try cold boot: Android Studio > AVD Manager > Cold Boot
- ✅ Check emulator has internet: open browser in emulator

### Issue 5: CORS errors (check Metro bundler logs)

**Solutions:**
Add CORS middleware to your backend:

```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📝 Quick Debug Checklist:

```
[ ] Backend server is running on port 5000
[ ] Can access http://localhost:5000/api/health in browser
[ ] Using correct API URL for your platform (10.0.2.2 for Android emulator)
[ ] Metro bundler is running (npm start)
[ ] No firewall blocking connections
[ ] Check Metro logs for errors (in terminal where you ran npm start)
[ ] Check backend logs for incoming requests
[ ] Test connection button shows success
```

---

## 📱 Platform-Specific URLs:

| Platform | API URL |
|----------|---------|
| Android Emulator | `http://10.0.2.2:5000/api` |
| iOS Simulator | `http://localhost:5000/api` |
| Physical Device | `http://YOUR_IP:5000/api` |
| Expo Web | `http://localhost:5000/api` |

---

## 🔍 Check Logs:

**Metro Bundler Logs:**
Look at the terminal where you ran `npm start` for:
- API URL being used (logged on startup)
- Network errors
- Console.log output from the app

**Backend Logs:**
Check your backend terminal for:
- Incoming requests to `/api/auth/login`
- Database connection status
- Authentication errors

**App Logs:**
The app now logs:
- API URL on startup
- Login attempts
- API errors with full details

---

## 🆘 Still Not Working?

1. **Use Test Connection button** - It will tell you exactly what's wrong

2. **Check Metro bundler terminal** for errors like:
   ```
   Network error - check if backend is running and accessible
   ```

3. **Try a simple curl test:**
   ```bash
   # From your computer:
   curl http://localhost:5000/api/health
   
   # Should return something like:
   {"status":"ok"}
   ```

4. **Backend running but app can't connect?**
   - Make sure backend is listening on `0.0.0.0` not just `localhost`
   - Check if port 5000 is accessible from network

5. **Clear everything and restart:**
   ```bash
   # Stop metro bundler (Ctrl+C)
   # Clear cache
   npx expo start -c
   ```

---

## 📞 Need More Help?

Check console logs in Metro bundler - they now show:
- Which API URL is being used
- Platform (iOS/Android)
- Detailed error information
- Network request details

The app will show you exactly what's wrong! 🎯
