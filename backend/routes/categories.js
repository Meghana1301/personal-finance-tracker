const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const [categories] = await global.db.query(
      'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY name',
      [req.user.id]
    );
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new category
router.post('/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['income', 'expense'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, type } = req.body;

      const [result] = await global.db.query(
        'INSERT INTO categories (name, type, user_id) VALUES (?, ?, ?)',
        [name, type, req.user.id]
      );

      res.status(201).json({
        id: result.insertId,
        name,
        type,
        user_id: req.user.id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update category
router.put('/:id',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['income', 'expense'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, type } = req.body;

      const [result] = await global.db.query(
        'UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?',
        [name, type, req.params.id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found or not owned by user' });
      }

      res.json({
        id: parseInt(req.params.id),
        name,
        type,
        user_id: req.user.id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if category is being used
    const [transactions] = await global.db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [req.params.id]
    );

    if (transactions[0].count > 0) {
      return res.status(400).json({
        message: 'Cannot delete category that is being used by transactions'
      });
    }

    const [result] = await global.db.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found or not owned by user' });
    }

    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 