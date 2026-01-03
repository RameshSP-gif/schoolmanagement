const express = require('express');
const { query } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get attendance
router.get('/', auth, authorize('admin', 'teacher', 'staff'), async (req, res) => {
  try {
    const { class_id, date, student_id } = req.query;
    
    let query = `
      SELECT a.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             s.admission_number, s.roll_number,
             c.name as class_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    
    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY a.date DESC, s.roll_number';
    
    const [attendance] = query(query, params);
    
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance
router.post('/', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of {student_id, class_id, date, status, remarks}

    const values = attendanceData.map(item => [
      item.student_id,
      item.class_id,
      item.date,
      item.status,
      item.remarks,
      req.user.id
    ]);

    query(
      `INSERT INTO attendance (student_id, class_id, date, status, remarks, marked_by)
       VALUES ?
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
      [values]
    );

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attendance
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    query(
      `UPDATE attendance SET status = ?, remarks = ? WHERE id = ?`,
      [status, remarks, req.params.id]
    );

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance statistics
router.get('/statistics/:student_id', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_days
      FROM attendance
      WHERE student_id = ?
    `;
    
    const params = [req.params.student_id];
    
    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }
    
    const [stats] = query(query, params);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Get attendance statistics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
