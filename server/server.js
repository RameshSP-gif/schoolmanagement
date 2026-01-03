const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Initialize database
const { initDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const assignmentRoutes = require('./routes/assignments');
const feeRoutes = require('./routes/fees');
const announcementRoutes = require('./routes/announcements');

const app = express();

// Initialize database before starting server
initDatabase().then(() => {
  console.log('✅ Database ready');
}).catch(err => {
  console.error('❌ Database init failed:', err);
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'School Management System API is running',
    environment: process.env.NODE_ENV,
    database: process.env.DB_HOST ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'School Management System API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/students',
      '/api/teachers',
      '/api/classes'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 School Management System API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
