const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const [transactions] = await global.db.query(
      `SELECT t.*, c.name as category_name, c.type as category_type 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ? 
       ORDER BY t.date DESC`,
      [req.user.id]
    );
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new transaction
router.post('/',
  auth,
  [
    body('amount').isFloat(),
    body('description').trim().notEmpty(),
    body('category_id').isInt(),
    body('date').isISO8601().toDate(),
    body('type').isIn(['income', 'expense'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description, category_id, date, type } = req.body;

      const [result] = await global.db.query(
        'INSERT INTO transactions (user_id, amount, description, category_id, date, type) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, amount, description, category_id, date, type]
      );

      const [newTransaction] = await global.db.query(
        `SELECT t.*, c.name as category_name, c.type as category_type 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.id = ?`,
        [result.insertId]
      );

      res.status(201).json(newTransaction[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update transaction
router.put('/:id',
  auth,
  [
    body('amount').isFloat(),
    body('description').trim().notEmpty(),
    body('category_id').isInt(),
    body('date').isISO8601().toDate(),
    body('type').isIn(['income', 'expense'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description, category_id, date, type } = req.body;

      const [result] = await global.db.query(
        `UPDATE transactions 
         SET amount = ?, description = ?, category_id = ?, date = ?, type = ? 
         WHERE id = ? AND user_id = ?`,
        [amount, description, category_id, date, type, req.params.id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      const [updatedTransaction] = await global.db.query(
        `SELECT t.*, c.name as category_name, c.type as category_type 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.id = ?`,
        [req.params.id]
      );

      res.json(updatedTransaction[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await global.db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const [monthlyStats] = await global.db.query(
      `SELECT 
         DATE_FORMAT(date, '%Y-%m') as month,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
       FROM transactions 
       WHERE user_id = ? 
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`,
      [req.user.id]
    );

    const [categoryStats] = await global.db.query(
      `SELECT 
         c.name,
         c.type,
         SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       GROUP BY c.id
       ORDER BY total DESC`,
      [req.user.id]
    );

    res.json({
      monthly: monthlyStats,
      byCategory: categoryStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 