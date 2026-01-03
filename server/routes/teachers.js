const express = require('express');
const { query } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all teachers
router.get('/', auth, authorize('admin', 'staff', 'teacher'), async (req, res) => {
  try {
    const { department, search } = req.query;
    
    let query = `
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.date_of_birth, u.gender, u.profile_image
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.is_active = true
    `;
    
    const params = [];
    
    if (department) {
      query += ' AND t.department = ?';
      params.push(department);
    }
    
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR t.employee_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY u.first_name, u.last_name';
    
    const [teachers] = query(query, params);
    
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single teacher
router.get('/:id', auth, async (req, res) => {
  try {
    const [teachers] = query(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.address, u.date_of_birth, u.gender, u.profile_image
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (teachers.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teachers[0]);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create teacher (Admin)
router.post('/', auth, authorize('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      email, password, first_name, last_name, phone, address, date_of_birth, gender,
      employee_id, department, qualification, experience_years, joining_date, salary
    } = req.body;

    // Check if email exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || 'teacher123', 10);
    
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, address, date_of_birth, gender) 
       VALUES (?, ?, 'teacher', ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name, phone, address, date_of_birth, gender]
    );

    // Create teacher
    const [teacherResult] = await connection.query(
      `INSERT INTO teachers (user_id, employee_id, department, qualification, experience_years, joining_date, salary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, employee_id, department, qualification, experience_years, joining_date, salary]
    );

    await connection.commit();

    res.status(201).json({ 
      message: 'Teacher created successfully',
      teacherId: teacherResult.insertId,
      userId: userResult.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
});

// Update teacher
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      first_name, last_name, phone, address, date_of_birth, gender,
      department, qualification, experience_years, salary
    } = req.body;

    // Get user_id
    const [teachers] = await connection.query('SELECT user_id FROM teachers WHERE id = ?', [req.params.id]);
    
    if (teachers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update user
    await connection.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, date_of_birth = ?, gender = ? 
       WHERE id = ?`,
      [first_name, last_name, phone, address, date_of_birth, gender, teachers[0].user_id]
    );

    // Update teacher
    await connection.query(
      `UPDATE teachers SET department = ?, qualification = ?, experience_years = ?, salary = ? 
       WHERE id = ?`,
      [department, qualification, experience_years, salary, req.params.id]
    );

    await connection.commit();

    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
});

// Delete teacher
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const [teachers] = query('SELECT user_id FROM teachers WHERE id = ?', [req.params.id]);
    
    if (teachers.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Soft delete - deactivate user
    query('UPDATE users SET is_active = false WHERE id = ?', [teachers[0].user_id]);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get teacher's classes
router.get('/:id/classes', auth, async (req, res) => {
  try {
    const [classes] = query(`
      SELECT c.*, COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
      ORDER BY c.grade_level, c.section
    `, [req.params.id]);

    res.json(classes);
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get teacher's subjects
router.get('/:id/subjects', auth, async (req, res) => {
  try {
    const [subjects] = query(`
      SELECT cs.*, s.name as subject_name, s.code, c.name as class_name, c.grade_level
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      JOIN classes c ON cs.class_id = c.id
      WHERE cs.teacher_id = ?
      ORDER BY c.grade_level, c.name
    `, [req.params.id]);

    res.json(subjects);
  } catch (error) {
    console.error('Get teacher subjects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get teacher's schedule
router.get('/:id/schedule', auth, async (req, res) => {
  try {
    const [schedule] = query(`
      SELECT t.*, s.name as subject_name, c.name as class_name, c.grade_level
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      WHERE t.teacher_id = ?
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        t.start_time
    `, [req.params.id]);

    res.json(schedule);
  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
