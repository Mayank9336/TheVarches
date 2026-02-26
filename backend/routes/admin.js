const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [[user]] = await db.query('SELECT * FROM users WHERE email = ? AND role = "admin"', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ total_sketches }]] = await db.query('SELECT COUNT(*) AS total_sketches FROM sketches');
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]] = await db.query('SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != "cancelled"');
    const [[{ total_inquiries }]] = await db.query('SELECT COUNT(*) AS total_inquiries FROM inquiries');

    res.json({ total_sketches, total_orders, total_revenue, total_inquiries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
