const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// POST create order
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, shipping_address, items, notes } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !items?.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    // Fetch prices from DB
    let total = 0;
    const enrichedItems = [];
    for (const item of items) {
      const [[sketch]] = await db.query('SELECT id, price, stock_qty, title FROM sketches WHERE id = ?', [item.sketch_id]);
      if (!sketch) return res.status(400).json({ error: `Sketch ${item.sketch_id} not found` });
      if (sketch.stock_qty < item.quantity) return res.status(400).json({ error: `${sketch.title} is out of stock` });
      total += sketch.price * item.quantity;
      enrichedItems.push({ ...item, price: sketch.price });
    }

    const order_number = 'TV-' + uuidv4().split('-')[0].toUpperCase();

    const [orderResult] = await db.query(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order_number, customer_name, customer_email, customer_phone, shipping_address, total, notes]
    );

    for (const item of enrichedItems) {
      await db.query(
        `INSERT INTO order_items (order_id, sketch_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.sketch_id, item.quantity, item.price]
      );
      await db.query('UPDATE sketches SET stock_qty = stock_qty - ? WHERE id = ?', [item.quantity, item.sketch_id]);
    }

    res.status(201).json({ order_number, order_id: orderResult.insertId, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all orders (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, 
        GROUP_CONCAT(s.title SEPARATOR ', ') AS sketch_titles
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN sketches s ON oi.sketch_id = s.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[order]] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items] = await db.query(`
      SELECT oi.*, s.title, s.image_url FROM order_items oi
      JOIN sketches s ON oi.sketch_id = s.id WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update order status (admin)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
