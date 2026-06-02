import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const returns = queryAll(`
    SELECT r.*, pr.name as product_name, s.id as sale_id
    FROM returns r
    LEFT JOIN products pr ON r.product_id = pr.id
    LEFT JOIN sales s ON r.sale_id = s.id
    ORDER BY r.created_at DESC
  `);
  res.json(returns);
});

router.post('/', ensureAuthenticated, (req, res) => {
  const { product_id, qty, reason, sale_id } = req.body;
  if (!product_id || !qty) return res.status(400).json({ error: 'product_id and qty are required' });

  execute('INSERT INTO returns (sale_id, product_id, qty, reason) VALUES (?, ?, ?, ?)',
    [sale_id || null, product_id, qty, reason || null]);

  execute('UPDATE products SET stock = stock + ?, updated_at = datetime(\'now\') WHERE id = ?', [qty, product_id]);
  execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [product_id, -qty, 'Retour']);

  saveDb();
  const r = queryOne('SELECT * FROM returns WHERE id = ?', [getLastInsertId()]);
  const pr = queryOne('SELECT name FROM products WHERE id = ?', [product_id]);
  res.status(201).json({ ...r, product_name: pr?.name });
});

export default router;
