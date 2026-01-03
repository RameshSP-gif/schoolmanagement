const express = require('express');
const { query } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all assignments
router.get('/', auth, async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id } = req.query;
    
    let query = `
      SELECT a.*, 
             s.name as subject_name,
             c.name as class_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    
    if (subject_id) {
      query += ' AND a.subject_id = ?';
      params.push(subject_id);
    }
    
    if (teacher_id) {
      query += ' AND a.teacher_id = ?';
      params.push(teacher_id);
    }
    
    query += ' ORDER BY a.due_date DESC';
    
    const [assignments] = query(query, params);
    
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const [assignments] = query(`
      SELECT a.*, 
             s.name as subject_name,
             c.name as class_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignments[0]);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create assignment
router.post('/', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, class_id, subject_id, due_date, total_marks, file_path } = req.body;
    
    // Get teacher_id
    let teacher_id;
    if (req.user.role === 'teacher') {
      const [teacher] = query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
      teacher_id = teacher[0]?.id;
    } else {
      teacher_id = req.body.teacher_id;
    }

    const [result] = query(
      `INSERT INTO assignments (title, description, class_id, subject_id, teacher_id, due_date, total_marks, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, class_id, subject_id, teacher_id, due_date, total_marks, file_path]
    );

    res.status(201).json({ 
      message: 'Assignment created successfully',
      assignmentId: result.insertId
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update assignment
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, due_date, total_marks, file_path } = req.body;

    query(
      `UPDATE assignments SET title = ?, description = ?, due_date = ?, total_marks = ?, file_path = ?
       WHERE id = ?`,
      [title, description, due_date, total_marks, file_path, req.params.id]
    );

    res.json({ message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete assignment
router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    query('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit assignment
router.post('/:id/submit', auth, authorize('student'), async (req, res) => {
  try {
    const { file_path, remarks } = req.body;
    
    // Get student_id
    const [student] = query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    
    if (!student.length) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [result] = query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, file_path, remarks)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), remarks = VALUES(remarks), submission_date = NOW()`,
      [req.params.id, student[0].id, file_path, remarks]
    );

    res.status(201).json({ 
      message: 'Assignment submitted successfully',
      submissionId: result.insertId
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Grade assignment submission
router.put('/submissions/:id/grade', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { marks_obtained } = req.body;
    
    // Get teacher_id
    let graded_by;
    if (req.user.role === 'teacher') {
      const [teacher] = query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
      graded_by = teacher[0]?.id;
    }

    query(
      `UPDATE assignment_submissions SET marks_obtained = ?, graded_by = ?, graded_at = NOW()
       WHERE id = ?`,
      [marks_obtained, graded_by, req.params.id]
    );

    res.json({ message: 'Assignment graded successfully' });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignment submissions
router.get('/:id/submissions', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const [submissions] = query(`
      SELECT asub.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             s.admission_number, s.roll_number
      FROM assignment_submissions asub
      JOIN students s ON asub.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE asub.assignment_id = ?
      ORDER BY s.roll_number
    `, [req.params.id]);

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
