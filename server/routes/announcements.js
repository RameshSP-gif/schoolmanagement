const express = require('express');
const { query } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    const { target_audience } = req.query;
    
    let query = `
      SELECT a.*, 
             CONCAT(u.first_name, ' ', u.last_name) as posted_by_name
      FROM announcements a
      JOIN users u ON a.posted_by = u.id
      WHERE a.is_active = true
    `;
    
    const params = [];
    
    if (target_audience) {
      query += ' AND (a.target_audience = ? OR a.target_audience = "all")';
      params.push(target_audience);
    } else {
      // Show based on user role
      query += ' AND (a.target_audience = ? OR a.target_audience = "all")';
      params.push(req.user.role);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [announcements] = query(query, params);
    
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create announcement
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { title, content, target_audience } = req.body;

    const [result] = query(
      `INSERT INTO announcements (title, content, target_audience, posted_by)
       VALUES (?, ?, ?, ?)`,
      [title, content, target_audience, req.user.id]
    );

    res.status(201).json({ 
      message: 'Announcement created successfully',
      announcementId: result.insertId
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update announcement
router.put('/:id', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { title, content, target_audience, is_active } = req.body;

    query(
      `UPDATE announcements SET title = ?, content = ?, target_audience = ?, is_active = ?
       WHERE id = ?`,
      [title, content, target_audience, is_active, req.params.id]
    );

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete announcement
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    query('UPDATE announcements SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
