import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const returns = queryAll(`
    SELECT r.*, pr.name as product_name, pr.price, s.id as sale_id
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
  const returnId = getLastInsertId();

  execute('UPDATE products SET stock = stock + ?, updated_at = datetime(\'now\') WHERE id = ?', [qty, product_id]);
  execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [product_id, -qty, 'Retour']);

  saveDb();
  const r = queryOne('SELECT * FROM returns WHERE id = ?', [returnId]);
  const pr = queryOne('SELECT name, price FROM products WHERE id = ?', [product_id]);
  res.status(201).json({ ...r, product_name: pr?.name, price: pr?.price });
});

router.put('/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const { product_id, qty, reason, sale_id } = req.body;
  
  if (!product_id || !qty) return res.status(400).json({ error: 'product_id and qty are required' });
  
  const ret = queryOne('SELECT * FROM returns WHERE id = ?', [id]);
  if (!ret) return res.status(404).json({ error: 'Return not found' });

  // Revert old stock change
  execute('UPDATE products SET stock = stock - ?, updated_at = datetime(\'now\') WHERE id = ?', [ret.qty, ret.product_id]);
  execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [ret.product_id, ret.qty, 'Annulation modification retour']);

  // Apply new stock change
  execute('UPDATE returns SET product_id = ?, qty = ?, reason = ?, sale_id = ? WHERE id = ?', 
    [product_id, qty, reason || null, sale_id || null, id]);
  execute('UPDATE products SET stock = stock + ?, updated_at = datetime(\'now\') WHERE id = ?', [qty, product_id]);
  execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [product_id, -qty, 'Modification retour']);

  saveDb();
  const r = queryOne('SELECT * FROM returns WHERE id = ?', [id]);
  const pr = queryOne('SELECT name, price FROM products WHERE id = ?', [product_id]);
  res.json({ ...r, product_name: pr?.name, price: pr?.price });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const ret = queryOne('SELECT * FROM returns WHERE id = ?', [id]);
  if (!ret) return res.status(404).json({ error: 'Return not found' });

  execute('UPDATE products SET stock = stock - ?, updated_at = datetime(\'now\') WHERE id = ?', [ret.qty, ret.product_id]);
  execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [ret.product_id, ret.qty, 'Annulation retour']);
  execute('DELETE FROM returns WHERE id = ?', [id]);

  saveDb();
  res.json({ success: true });
});

export default router;
