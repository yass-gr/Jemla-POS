import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const purchases = queryAll(`
    SELECT p.*, pr.name as product_name
    FROM purchases p
    LEFT JOIN products pr ON p.product_id = pr.id
    ORDER BY p.created_at DESC
  `);
  res.json(purchases);
});

router.post('/', ensureAuthenticated, (req, res) => {
  const { product_id, supplier, qty, unit_price } = req.body;
  if (!product_id || !qty || !unit_price) return res.status(400).json({ error: 'product_id, qty, and unit_price are required' });

  const total = qty * unit_price;
  execute('INSERT INTO purchases (product_id, supplier, qty, unit_price, total) VALUES (?, ?, ?, ?, ?)',
    [product_id, supplier || null, qty, unit_price, total]);

  execute('UPDATE products SET stock = stock + ?, updated_at = datetime(\'now\') WHERE id = ?', [qty, product_id]);
  execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [product_id, qty, 'Achat fournisseur']);

  saveDb();
  const p = queryOne('SELECT * FROM purchases WHERE id = ?', [getLastInsertId()]);
  const pr = queryOne('SELECT name FROM products WHERE id = ?', [product_id]);
  res.status(201).json({ ...p, product_name: pr?.name });
});

export default router;
