import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const products = queryAll('SELECT * FROM products ORDER BY created_at DESC');
  res.json(products);
});

router.get('/:id', ensureAuthenticated, (req, res) => {
  const product = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', ensureAuthenticated, (req, res) => {
  const { name, category, price, unit, stock, image_url } = req.body;
  if (!name || !category || !price || !unit) {
    return res.status(400).json({ error: 'name, category, price, and unit are required' });
  }

  execute(
    'INSERT INTO products (name, category, price, unit, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, price, unit, stock || 0, image_url || null]
  );
  saveDb();

  const product = queryOne('SELECT * FROM products WHERE id = ?', [getLastInsertId()]);
  res.status(201).json(product);
});

router.put('/:id', ensureAuthenticated, (req, res) => {
  const { name, category, price, unit, stock, image_url } = req.body;

  const existing = queryOne('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  execute(
    `UPDATE products SET name = COALESCE(?, name), category = COALESCE(?, category),
     price = COALESCE(?, price), unit = COALESCE(?, unit),
     stock = COALESCE(?, stock), image_url = COALESCE(?, image_url),
     updated_at = datetime('now')
     WHERE id = ?`,
    [name || null, category || null, price ?? null, unit || null, stock ?? null, image_url ?? null, req.params.id]
  );
  saveDb();

  const product = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(product);
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
  const existing = queryOne('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  execute('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ message: 'Product deleted' });
});

export default router;
