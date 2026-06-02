import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const customers = queryAll('SELECT * FROM customers ORDER BY created_at DESC');
  res.json(customers);
});

router.get('/:id', ensureAuthenticated, (req, res) => {
  const customer = queryOne('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

router.post('/', ensureAuthenticated, (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  execute(
    'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
    [name, phone || null, email || null, address || null]
  );
  saveDb();

  const customer = queryOne('SELECT * FROM customers WHERE id = ?', [getLastInsertId()]);
  res.status(201).json(customer);
});

router.put('/:id', ensureAuthenticated, (req, res) => {
  const { name, phone, email, address } = req.body;
  const existing = queryOne('SELECT id FROM customers WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  execute(
    `UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone),
     email = COALESCE(?, email), address = COALESCE(?, address),
     updated_at = datetime('now')
     WHERE id = ?`,
    [name || null, phone ?? null, email ?? null, address ?? null, req.params.id]
  );
  saveDb();

  const customer = queryOne('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  res.json(customer);
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
  const existing = queryOne('SELECT id FROM customers WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  execute('DELETE FROM customers WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ message: 'Customer deleted' });
});

export default router;
