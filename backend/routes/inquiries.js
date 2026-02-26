const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { name, email, message, sketch_id } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required' });

    await db.query('INSERT INTO inquiries (name, email, message, sketch_id) VALUES (?, ?, ?, ?)',
      [name, email, message, sketch_id || null]);

    res.status(201).json({ message: 'Inquiry sent successfully! We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, s.title AS sketch_title FROM inquiries i
      LEFT JOIN sketches s ON i.sketch_id = s.id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
