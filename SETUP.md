# SETUP INSTRUCTIONS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Step 1: Install Dependencies

### Install Backend Dependencies
```powershell
npm install
```

### Install Frontend Dependencies
```powershell
cd client
npm install
cd ..
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

2. Open `.env` and update with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
DB_PORT=3306

JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d

PORT=5000
CLIENT_URL=http://localhost:3000
```

## Step 3: Setup Database

Run the database setup script to create tables and insert sample data:
```powershell
node server/config/setupDatabase.js
```

This will:
- Create the `school_management` database
- Create all required tables
- Insert default users with credentials

## Step 4: Start the Application

### Option 1: Run Both (Backend + Frontend) - Separate Terminals

Terminal 1 - Start Backend:
```powershell
npm run server
```

Terminal 2 - Start Frontend:
```powershell
npm run client
```

### Option 2: Development Mode

Backend only:
```powershell
npm run dev
```

Frontend only:
```powershell
cd client
npm start
```

## Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

### Admin
- Email: admin@school.com
- Password: admin123

### Teacher
- Email: teacher@school.com
- Password: teacher123

### Student
- Email: student@school.com
- Password: student123

### Parent
- Email: parent@school.com
- Password: parent123

### Staff
- Email: staff@school.com
- Password: staff123

## Features by Role

### Admin Dashboard
- View system statistics
- Manage students (add, edit, delete)
- Manage teachers (add, edit, delete)
- Manage classes
- Fee management
- Generate reports

### Teacher Dashboard
- View assigned classes
- Create and grade assignments
- Mark attendance
- Post grades
- View student performance

### Student Dashboard
- View courses and schedule
- Submit assignments
- Check grades
- View attendance records
- View announcements
- Check fee status

### Parent Dashboard
- View children's information
- Check attendance
- View grades and assignments
- Fee payment status
- Communicate with teachers

### Staff Dashboard
- Process admissions
- Student management
- Fee collection
- Visitor management
- Generate reports

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in `.env` file
- Check if the database exists

### Port Already in Use
If port 5000 or 3000 is already in use, change it:
- Backend: Update `PORT` in `.env`
- Frontend: Update in `client/package.json` (add `"PORT=3001"` to start script)

### Module Not Found Errors
```powershell
# Backend
npm install

# Frontend
cd client
npm install
```

## Production Deployment

### Build Frontend
```powershell
cd client
npm run build
```

### Set Production Environment
Update `.env`:
```
NODE_ENV=production
```

### Start Production Server
```powershell
npm start
```

## Additional Configuration

### Email Configuration (Optional)
Add to `.env` for email notifications:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### File Upload Configuration (Optional)
Configure file upload limits in `server/server.js`:
```javascript
app.use(express.json({ limit: '10mb' }));
```

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure database is properly configured
4. Check that all required ports are available

## License

MIT License - See LICENSE file for details
