import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const favorites = queryAll(`
    SELECT p.* FROM products p
    INNER JOIN product_favorites f ON p.id = f.product_id
    WHERE f.user_id = ?
    ORDER BY p.name ASC
  `, [req.user.id]);
  res.json(favorites);
});

router.post('/', ensureAuthenticated, (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  execute(
    'INSERT OR IGNORE INTO product_favorites (user_id, product_id) VALUES (?, ?)',
    [req.user.id, product_id]
  );
  saveDb();
  res.status(201).json({ message: 'Added to favorites' });
});

router.delete('/:productId', ensureAuthenticated, (req, res) => {
  execute(
    'DELETE FROM product_favorites WHERE user_id = ? AND product_id = ?',
    [req.user.id, req.params.productId]
  );
  saveDb();
  res.json({ message: 'Removed from favorites' });
});

export default router;
