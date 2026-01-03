# Local MySQL Setup Guide

## Step 1: Install MySQL

### Option A: Using Chocolatey (Fastest)
If you have Chocolatey installed:
```powershell
choco install mysql -y
```

### Option B: Download MySQL Installer (Recommended)
1. Download: https://dev.mysql.com/downloads/installer/
2. Choose "MySQL Installer for Windows"
3. Download the smaller "mysql-installer-web-community" version
4. Run the installer
5. Choose "Developer Default" or "Server only"
6. Set root password (remember this!)
7. Complete installation

### Option C: Using XAMPP (Easiest for beginners)
1. Download: https://www.apachefriends.org/download.html
2. Install XAMPP
3. Start MySQL from XAMPP Control Panel
4. Default credentials: root / (no password)

## Step 2: Start MySQL Service

### If using MySQL directly:
```powershell
net start MySQL80
```

### If using XAMPP:
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL

## Step 3: Create Database and Import Schema

### Using MySQL Command Line:
```powershell
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE school_management;

# Exit MySQL
exit

# Import the schema
mysql -u root -p school_management < database.sql
```

### Using phpMyAdmin (if using XAMPP):
1. Go to http://localhost/phpmyadmin
2. Click "New" to create database
3. Name it: `school_management`
4. Click on the database
5. Go to "Import" tab
6. Choose your `database.sql` file
7. Click "Go"

## Step 4: Create Local .env File

Create a `.env` file in the server folder:
```bash
# Navigate to server folder
cd server

# Create .env file
New-Item -ItemType File -Path .env
```

Add these contents:
```env
PORT=5000
NODE_ENV=development

# Local MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=3f7a37a8e9b6da11b328ec44f7efcb54a3198f44b7245c8dc41b1308c118c39b13466f517d570ba1fe636b38f525c3f727db7c97e98733eb1d23eda50e532d5e
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## Step 5: Install Dependencies (if not done)
```powershell
cd C:\SchoolManagement
npm install
cd client
npm install
cd ..
```

## Step 6: Start the Application

### Terminal 1 - Start Backend:
```powershell
cd C:\SchoolManagement
npm run server
```

### Terminal 2 - Start Frontend:
```powershell
cd C:\SchoolManagement
npm run client
```

### Or Start Both Together:
```powershell
cd C:\SchoolManagement
# Install concurrently if not already installed
npm install -g concurrently

# Add to package.json scripts:
# "dev:all": "concurrently \"npm run server\" \"npm run client\""

# Then run:
npm run dev:all
```

## Step 7: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Quick Install Commands (Run in order)

```powershell
# 1. Download and install MySQL or XAMPP

# 2. Create database
mysql -u root -p -e "CREATE DATABASE school_management;"

# 3. Import schema
mysql -u root -p school_management < C:\SchoolManagement\database.sql

# 4. Create server .env file (see content above)

# 5. Start backend
cd C:\SchoolManagement
npm run server

# 6. In another terminal, start frontend
cd C:\SchoolManagement
npm run client
```

## Troubleshooting

### MySQL service won't start:
```powershell
# Check if service exists
Get-Service -Name MySQL*

# Start service
Start-Service MySQL80
```

### Can't connect to MySQL:
- Check MySQL is running
- Verify password is correct
- Try connecting without password if using XAMPP: `DB_PASSWORD=`

### Port already in use:
Change PORT in .env file to 5001 or another available port.
