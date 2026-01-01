const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, phone, address, date_of_birth, gender } = req.body;

    // Validate role
    const allowedRoles = ['student', 'parent', 'teacher', 'staff'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid user role. Admin accounts must be created by existing admins.' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, address, date_of_birth, gender) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, role, first_name, last_name, phone, address, date_of_birth, gender]
    );

    const userId = result.insertId;

    // Insert into role-specific table
    if (role === 'student') {
      await pool.query(
        `INSERT INTO students (user_id, admission_number, admission_date) 
         VALUES (?, ?, NOW())`,
        [userId, `STU${userId.toString().padStart(5, '0')}`]
      );
    } else if (role === 'teacher') {
      await pool.query(
        `INSERT INTO teachers (user_id, employee_id, joining_date) 
         VALUES (?, ?, NOW())`,
        [userId, `TCH${userId.toString().padStart(5, '0')}`]
      );
    } else if (role === 'staff') {
      await pool.query(
        `INSERT INTO staff (user_id, employee_id, joining_date) 
         VALUES (?, ?, NOW())`,
        [userId, `STF${userId.toString().padStart(5, '0')}`]
      );
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please login with your credentials.',
      userId: userId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Get additional role-specific info
    let roleInfo = {};
    
    if (user.role === 'student') {
      const [students] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students[0]) {
        const { id, ...rest } = students[0];
        roleInfo = { student_id: id, ...rest };
      }
    } else if (user.role === 'teacher') {
      const [teachers] = await pool.query('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
      if (teachers[0]) {
        const { id, ...rest } = teachers[0];
        roleInfo = { teacher_id: id, ...rest };
      }
    } else if (user.role === 'staff') {
      const [staff] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [user.id]);
      if (staff[0]) {
        const { id, ...rest } = staff[0];
        roleInfo = { staff_id: id, ...rest };
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profile_image: user.profile_image,
        ...roleInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, role, first_name, last_name, phone, address, date_of_birth, gender, profile_image FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get role-specific info
    let roleInfo = {};
    
    if (user.role === 'student') {
      const [students] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students[0]) {
        const { id, ...rest } = students[0];
        roleInfo = { student_id: id, ...rest };
      }
    } else if (user.role === 'teacher') {
      const [teachers] = await pool.query('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
      if (teachers[0]) {
        const { id, ...rest } = teachers[0];
        roleInfo = { teacher_id: id, ...rest };
      }
    } else if (user.role === 'staff') {
      const [staff] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [user.id]);
      if (staff[0]) {
        const { id, ...rest } = staff[0];
        roleInfo = { staff_id: id, ...rest };
      }
    } else if (user.role === 'parent') {
      const [children] = await pool.query(`
        SELECT s.*, u.first_name, u.last_name, c.name as class_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.parent_id = ?
      `, [user.id]);
      roleInfo = { children };
    }

    res.json({ ...user, ...roleInfo });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
