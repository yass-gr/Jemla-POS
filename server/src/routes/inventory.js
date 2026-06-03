import { Router } from 'express';
import { queryAll, execute, getDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const products = queryAll('SELECT id, name, category, price, price_wholesale, wholesale_min_qty, unit, stock, updated_at FROM products ORDER BY stock ASC');
  res.json(products);
});

router.get('/log', ensureAuthenticated, (req, res) => {
  const log = queryAll(`
    SELECT l.*, p.name as product_name
    FROM inventory_log l
    LEFT JOIN products p ON l.product_id = p.id
    ORDER BY l.created_at DESC
    LIMIT 50
  `);
  res.json(log);
});

router.post('/adjust', ensureAuthenticated, (req, res) => {
  const { productId, changeQty, reason } = req.body;
  if (!productId || changeQty === undefined || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDb();
  db.run('BEGIN TRANSACTION');
  try {
    execute('UPDATE products SET stock = stock + ?, updated_at = datetime("now") WHERE id = ?', [changeQty, productId]);
    execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [productId, changeQty, reason]);
    db.run('COMMIT');
    res.json({ success: true });
  } catch (err) {
    db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

export default router;
