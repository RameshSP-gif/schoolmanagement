const express = require('express');
const { query } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const [classes] = query(`
      SELECT c.*, 
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id
      ORDER BY c.grade_level, c.section
    `);

    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single class
router.get('/:id', auth, async (req, res) => {
  try {
    const [classes] = query(`
      SELECT c.*, 
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             t.employee_id
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classes[0]);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create class
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, grade_level, section, teacher_id, academic_year, capacity } = req.body;

    const [result] = query(
      `INSERT INTO classes (name, grade_level, section, teacher_id, academic_year, capacity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, grade_level, section, teacher_id, academic_year, capacity]
    );

    res.status(201).json({ 
      message: 'Class created successfully',
      classId: result.insertId
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update class
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, grade_level, section, teacher_id, academic_year, capacity } = req.body;

    query(
      `UPDATE classes SET name = ?, grade_level = ?, section = ?, teacher_id = ?, academic_year = ?, capacity = ?
       WHERE id = ?`,
      [name, grade_level, section, teacher_id, academic_year, capacity, req.params.id]
    );

    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete class
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    query('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get class students
router.get('/:id/students', auth, async (req, res) => {
  try {
    const [students] = query(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ? AND u.is_active = true
      ORDER BY s.roll_number
    `, [req.params.id]);

    res.json(students);
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get class subjects
router.get('/:id/subjects', auth, async (req, res) => {
  try {
    const [subjects] = query(`
      SELECT cs.*, s.name as subject_name, s.code,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN teachers t ON cs.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE cs.class_id = ?
    `, [req.params.id]);

    res.json(subjects);
  } catch (error) {
    console.error('Get class subjects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign subject to class
router.post('/:id/subjects', auth, authorize('admin'), async (req, res) => {
  try {
    const { subject_id, teacher_id } = req.body;

    const [result] = query(
      `INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`,
      [req.params.id, subject_id, teacher_id]
    );

    res.status(201).json({ 
      message: 'Subject assigned to class successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Assign subject error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
