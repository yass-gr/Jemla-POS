import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  res.json(queryAll('SELECT * FROM suppliers ORDER BY created_at DESC'));
});

router.get('/:id', ensureAuthenticated, (req, res) => {
  const s = queryOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
  if (!s) return res.status(404).json({ error: 'Supplier not found' });
  res.json(s);
});

router.post('/', ensureAuthenticated, (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  execute('INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)',
    [name, phone || null, email || null, address || null]);
  const supplierId = getLastInsertId();
  saveDb();
  res.status(201).json(queryOne('SELECT * FROM suppliers WHERE id = ?', [supplierId]));
});

router.put('/:id', ensureAuthenticated, (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!queryOne('SELECT id FROM suppliers WHERE id = ?', [req.params.id])) return res.status(404).json({ error: 'Supplier not found' });
  execute('UPDATE suppliers SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), address = COALESCE(?, address), updated_at = datetime(\'now\') WHERE id = ?',
    [name || null, phone ?? null, email ?? null, address ?? null, req.params.id]);
  saveDb();
  res.json(queryOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]));
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
  if (!queryOne('SELECT id FROM suppliers WHERE id = ?', [req.params.id])) return res.status(404).json({ error: 'Supplier not found' });
  execute('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ message: 'Supplier deleted' });
});

export default router;
