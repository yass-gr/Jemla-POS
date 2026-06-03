import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb, getDb } from '../db.js';
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

  const purchaseId = getLastInsertId();
  saveDb();
  const p = queryOne('SELECT * FROM purchases WHERE id = ?', [purchaseId]);
  const pr = queryOne('SELECT name FROM products WHERE id = ?', [product_id]);
  res.status(201).json({ ...p, product_name: pr?.name });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
  const purchase = queryOne('SELECT * FROM purchases WHERE id = ?', [req.params.id]);
  if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

  const db = getDb();
  db.run('BEGIN TRANSACTION');
  try {
    execute('DELETE FROM purchases WHERE id = ?', [purchase.id]);
    execute('UPDATE products SET stock = stock - ?, updated_at = datetime("now") WHERE id = ?', [purchase.qty, purchase.product_id]);
    execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [purchase.product_id, -purchase.qty, 'Suppression achat']);
    db.run('COMMIT');
    saveDb();
    res.json({ success: true });
  } catch (err) {
    db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

export default router;
