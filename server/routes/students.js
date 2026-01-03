const express = require('express');
const { query } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all students (Admin, Teacher, Staff)
router.get('/', auth, authorize('admin', 'teacher', 'staff'), async (req, res) => {
  try {
    const { class_id, search } = req.query;
    
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.date_of_birth, u.gender,
             c.name as class_name, c.grade_level, c.section,
             p.first_name as parent_first_name, p.last_name as parent_last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users p ON s.parent_id = p.id
      WHERE u.is_active = true
    `;
    
    const params = [];
    
    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(class_id);
    }
    
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR s.admission_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY c.grade_level, c.section, s.roll_number';
    
    const [students] = query(query, params);
    
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single student
router.get('/:id', auth, async (req, res) => {
  try {
    const [students] = query(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.address, u.date_of_birth, u.gender, u.profile_image,
             c.name as class_name, c.grade_level, c.section,
             p.first_name as parent_first_name, p.last_name as parent_last_name, p.email as parent_email, p.phone as parent_phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users p ON s.parent_id = p.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create student (Admin, Staff)
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      email, password, first_name, last_name, phone, address, date_of_birth, gender,
      admission_number, class_id, section, roll_number, admission_date, parent_id, blood_group
    } = req.body;

    // Check if email exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || 'student123', 10);
    
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, address, date_of_birth, gender) 
       VALUES (?, ?, 'student', ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name, phone, address, date_of_birth, gender]
    );

    // Create student
    const [studentResult] = await connection.query(
      `INSERT INTO students (user_id, admission_number, class_id, section, roll_number, admission_date, parent_id, blood_group)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, admission_number, class_id, section, roll_number, admission_date, parent_id, blood_group]
    );

    await connection.commit();

    res.status(201).json({ 
      message: 'Student created successfully',
      studentId: studentResult.insertId,
      userId: userResult.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
});

// Update student
router.put('/:id', auth, authorize('admin', 'staff'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      first_name, last_name, phone, address, date_of_birth, gender,
      class_id, section, roll_number, parent_id, blood_group
    } = req.body;

    // Get user_id
    const [students] = await connection.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    
    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update user
    await connection.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, date_of_birth = ?, gender = ? 
       WHERE id = ?`,
      [first_name, last_name, phone, address, date_of_birth, gender, students[0].user_id]
    );

    // Update student
    await connection.query(
      `UPDATE students SET class_id = ?, section = ?, roll_number = ?, parent_id = ?, blood_group = ? 
       WHERE id = ?`,
      [class_id, section, roll_number, parent_id, blood_group, req.params.id]
    );

    await connection.commit();

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
});

// Delete student
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const [students] = query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete - deactivate user
    query('UPDATE users SET is_active = false WHERE id = ?', [students[0].user_id]);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student attendance
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT a.*, c.name as class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
    `;
    
    const params = [req.params.id];
    
    if (start_date) {
      query += ' AND a.date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND a.date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY a.date DESC';
    
    const [attendance] = query(query, params);
    
    res.json(attendance);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student grades
router.get('/:id/grades', auth, async (req, res) => {
  try {
    const [grades] = query(`
      SELECT er.*, e.name as exam_name, e.exam_type, e.total_marks, e.date as exam_date,
             s.name as subject_name, c.name as class_name
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      JOIN classes c ON e.class_id = c.id
      WHERE er.student_id = ?
      ORDER BY e.date DESC
    `, [req.params.id]);

    res.json(grades);
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student assignments
router.get('/:id/assignments', auth, async (req, res) => {
  try {
    const [student] = query('SELECT class_id FROM students WHERE id = ?', [req.params.id]);
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [assignments] = query(`
      SELECT a.*, s.name as subject_name, 
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             asub.submission_date, asub.marks_obtained, asub.file_path as submission_file
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE a.class_id = ?
      ORDER BY a.due_date DESC
    `, [req.params.id, student[0].class_id]);

    res.json(assignments);
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
