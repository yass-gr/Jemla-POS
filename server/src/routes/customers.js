import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb, getDb } from '../db.js';
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
  const { name, phone, email, address, delivery_address } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  execute(
    'INSERT INTO customers (name, phone, email, address, delivery_address) VALUES (?, ?, ?, ?, ?)',
    [name, phone || null, email || null, address || null, delivery_address || null]
  );
  const customerId = getLastInsertId();
  saveDb();

  const customer = queryOne('SELECT * FROM customers WHERE id = ?', [customerId]);
  res.status(201).json(customer);
});

router.put('/:id', ensureAuthenticated, (req, res) => {
  const { name, phone, email, address, delivery_address } = req.body;
  const existing = queryOne('SELECT id FROM customers WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  execute(
    `UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone),
     email = COALESCE(?, email), address = COALESCE(?, address),
     delivery_address = COALESCE(?, delivery_address),
     updated_at = datetime('now')
     WHERE id = ?`,
    [name || null, phone ?? null, email ?? null, address ?? null, delivery_address ?? null, req.params.id]
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

router.post('/:id/payments', ensureAuthenticated, (req, res) => {
  const { amount, payment_method, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

  const existing = queryOne('SELECT id, debt_balance FROM customers WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  const db = getDb();
  db.run('BEGIN TRANSACTION');
  try {
    execute('INSERT INTO customer_payments (customer_id, amount, payment_method, note) VALUES (?, ?, ?, ?)', [req.params.id, amount, payment_method || 'cash', note || null]);
    execute('UPDATE customers SET debt_balance = debt_balance - ?, updated_at = datetime("now") WHERE id = ?', [amount, req.params.id]);
    db.run('COMMIT');
    saveDb();
    
    const paymentId = getLastInsertId();
    const payment = queryOne('SELECT * FROM customer_payments WHERE id = ?', [paymentId]);
    res.status(201).json(payment);
  } catch (err) {
    db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

export default router;
