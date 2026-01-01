const express = require('express');
const pool = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all fees
router.get('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, student_id } = req.query;
    
    let query = `
      SELECT f.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             s.admission_number,
             c.name as class_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
    }
    
    if (student_id) {
      query += ' AND f.student_id = ?';
      params.push(student_id);
    }
    
    query += ' ORDER BY f.due_date DESC';
    
    const [fees] = await pool.query(query, params);
    
    res.json(fees);
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student fees
router.get('/student/:student_id', auth, async (req, res) => {
  try {
    const [fees] = await pool.query(`
      SELECT f.*
      FROM fees f
      WHERE f.student_id = ?
      ORDER BY f.due_date DESC
    `, [req.params.student_id]);

    res.json(fees);
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create fee
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { student_id, fee_type, amount, due_date, academic_year, remarks } = req.body;

    const [result] = await pool.query(
      `INSERT INTO fees (student_id, fee_type, amount, due_date, academic_year, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, fee_type, amount, due_date, academic_year, remarks]
    );

    res.status(201).json({ 
      message: 'Fee created successfully',
      feeId: result.insertId
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update fee
router.put('/:id', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { student_id, fee_type, amount, due_date, academic_year, remarks, status } = req.body;

    await pool.query(
      `UPDATE fees SET student_id = ?, fee_type = ?, amount = ?, due_date = ?, 
       academic_year = ?, remarks = ?, status = ?
       WHERE id = ?`,
      [student_id, fee_type, amount, due_date, academic_year, remarks, status || 'pending', req.params.id]
    );

    res.json({ message: 'Fee updated successfully' });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record payment
router.post('/:id/pay', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { paid_amount, payment_mode, payment_date } = req.body;

    // Get current fee
    const [fees] = await pool.query('SELECT amount, paid_amount FROM fees WHERE id = ?', [req.params.id]);
    
    if (fees.length === 0) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    const totalPaid = (fees[0].paid_amount || 0) + paid_amount;
    const status = totalPaid >= fees[0].amount ? 'paid' : 'partial';

    await pool.query(
      `UPDATE fees SET paid_amount = ?, status = ?, payment_mode = ?, payment_date = ?
       WHERE id = ?`,
      [totalPaid, status, payment_mode, payment_date || new Date(), req.params.id]
    );

    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update fee status (for marking overdue)
router.put('/:id/status', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query('UPDATE fees SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({ message: 'Fee status updated successfully' });
  } catch (error) {
    console.error('Update fee status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get fee statistics
router.get('/statistics', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_fees,
        SUM(amount) as total_amount,
        SUM(paid_amount) as total_paid,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count
      FROM fees
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get fee statistics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
