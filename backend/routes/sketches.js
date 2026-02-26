const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET all sketches with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, sort = 'created_at', order = 'DESC', limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, c.name AS category_name, c.slug AS category_slug
      FROM sketches s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (featured === 'true') {
      query += ` AND s.is_featured = TRUE`;
    }
    if (search) {
      query += ` AND (s.title LIKE ? OR s.description LIKE ? OR s.tags LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const validSorts = ['price', 'created_at', 'title'];
    const sortCol = validSorts.includes(sort) ? sort : 'created_at';
    query += ` ORDER BY s.${sortCol} ${order === 'ASC' ? 'ASC' : 'DESC'}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    // Count total for pagination
    let countQuery = `SELECT COUNT(*) AS total FROM sketches s LEFT JOIN categories c ON s.category_id = c.id WHERE 1=1`;
    const countParams = [];
    if (category) { countQuery += ` AND c.slug = ?`; countParams.push(category); }
    if (featured === 'true') { countQuery += ` AND s.is_featured = TRUE`; }

    const [[{ total }]] = await db.query(countQuery, countParams);

    res.json({ sketches: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single sketch by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, c.name AS category_name, c.slug AS category_slug
      FROM sketches s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Sketch not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new sketch (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category_id, image_url, thumbnail_url, medium, dimensions, is_original, stock_qty, is_featured, tags } = req.body;

    if (!title || !price) return res.status(400).json({ error: 'Title and price are required' });

    const [result] = await db.query(`
      INSERT INTO sketches (title, description, price, category_id, image_url, thumbnail_url, medium, dimensions, is_original, stock_qty, is_featured, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, price, category_id, image_url, thumbnail_url, medium, dimensions, is_original ?? true, stock_qty ?? 1, is_featured ?? false, tags]);

    const [newSketch] = await db.query('SELECT * FROM sketches WHERE id = ?', [result.insertId]);
    res.status(201).json(newSketch[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update sketch (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category_id, image_url, thumbnail_url, medium, dimensions, is_original, stock_qty, is_featured, tags } = req.body;

    await db.query(`
      UPDATE sketches SET title=?, description=?, price=?, category_id=?, image_url=?, thumbnail_url=?,
      medium=?, dimensions=?, is_original=?, stock_qty=?, is_featured=?, tags=?
      WHERE id=?
    `, [title, description, price, category_id, image_url, thumbnail_url, medium, dimensions, is_original, stock_qty, is_featured, tags, req.params.id]);

    const [updated] = await db.query('SELECT * FROM sketches WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE sketch (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM sketches WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sketch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
