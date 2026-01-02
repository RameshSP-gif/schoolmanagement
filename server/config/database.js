const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration for cloud databases (PlanetScale, etc.)
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('psdb.cloud') 
    ? { rejectUnauthorized: true } 
    : process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
