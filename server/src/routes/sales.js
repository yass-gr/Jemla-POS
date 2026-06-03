import { Router } from 'express';
import { queryAll, queryOne, execute, getLastInsertId, saveDb, getDb } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/stats', ensureAuthenticated, (req, res) => {
  const stats = queryOne(`
    SELECT
      COALESCE(SUM(total), 0) as total_revenue,
      COUNT(*) as total_sales,
      COALESCE(SUM(CASE WHEN customer_id IS NOT NULL THEN total ELSE 0 END), 0) as debt_sales
    FROM sales WHERE status = 'completed'
  `);

  const pendingDebts = queryOne(`
    SELECT COALESCE(SUM(debt_balance), 0) as total FROM customers
  `);

  res.json({
    totalRevenue: stats.total_revenue,
    totalSales: stats.total_sales,
    pendingDebts: pendingDebts.total,
  });
});

router.post('/', ensureAuthenticated, (req, res) => {
  const {
    customer_id, items, payment_method = 'cash', amount_paid,
    discount_total = 0, discount_note, note,
    delivery_address, delivery_date, delivery_fee = 0,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  let subtotal = 0;
  const stmt = getDb().prepare(
    'INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit, discount, discount_type, note, original_price, tax_rate, tax_exempt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  execute(
    'INSERT INTO sales (customer_id, user_id, total, tax, status, payment_method, payment_status, amount_paid, change_due, discount_total, discount_note, note, delivery_address, delivery_date, delivery_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [customer_id || null, req.user.id, 0, 0, 'completed', payment_method, 'paid', 0, 0, discount_total, discount_note || null, note || null, delivery_address || null, delivery_date || null, delivery_fee || 0]
  );
  const saleId = getLastInsertId();

  for (const item of items) {
    const originalPrice = item.original_price || item.price;
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    stmt.bind([
      saleId, item.product_id, item.product_name,
      item.price, item.qty, item.unit,
      item.discount || 0, item.discount_type || 'fixed',
      item.note || null, originalPrice,
      item.tax_rate ?? 0.05, item.tax_exempt ? 1 : 0
    ]);
    stmt.step();
    stmt.reset();

    execute('UPDATE products SET stock = stock - ?, updated_at = datetime(\'now\') WHERE id = ?', [item.qty, item.product_id]);
    execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [item.product_id, -item.qty, 'sale']);
  }
  stmt.free();

  let finalTotal = subtotal + (subtotal * 0.05) - discount_total + (delivery_fee || 0);
  if (finalTotal < 0) finalTotal = 0;

  const taxAmount = subtotal * 0.05;
  const paid = amount_paid !== undefined ? Math.min(amount_paid, finalTotal) : finalTotal;
  const change = amount_paid !== undefined && amount_paid > finalTotal ? amount_paid - finalTotal : 0;
  const paymentStatus = paid >= finalTotal ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

  execute(
    `UPDATE sales SET total = ?, tax = ?, amount_paid = ?, change_due = ?, payment_status = ? WHERE id = ?`,
    [finalTotal, taxAmount, paid, change, paymentStatus, saleId]
  );

  if (customer_id && paid < finalTotal) {
    const remainder = finalTotal - paid;
    execute('UPDATE customers SET debt_balance = debt_balance + ?, updated_at = datetime(\'now\') WHERE id = ?', [remainder, customer_id]);
  }

  saveDb();

  const sale = queryOne('SELECT * FROM sales WHERE id = ?', [saleId]);
  const saleItems = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);
  sale.items = saleItems;

  res.status(201).json(sale);
});

router.post('/hold', ensureAuthenticated, (req, res) => {
  const { customer_id, items, note } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  execute(
    'INSERT INTO sales (customer_id, user_id, total, tax, status, note) VALUES (?, ?, ?, ?, ?, ?)',
    [customer_id || null, req.user.id, 0, 0, 'held', note || null]
  );
  const saleId = getLastInsertId();

  const stmt = getDb().prepare(
    'INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit, discount, discount_type, note, original_price, tax_rate, tax_exempt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const item of items) {
    stmt.bind([
      saleId, item.product_id, item.product_name,
      item.price, item.qty, item.unit,
      item.discount || 0, item.discount_type || 'fixed',
      item.note || null, item.original_price || item.price,
      item.tax_rate ?? 0.05, item.tax_exempt ? 1 : 0
    ]);
    stmt.step();
    stmt.reset();
  }
  stmt.free();

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = total * 0.05;
  execute('UPDATE sales SET total = ?, tax = ? WHERE id = ?', [total, tax, saleId]);

  saveDb();
  res.status(201).json({ id: saleId, message: 'Order held' });
});

router.get('/held', ensureAuthenticated, (req, res) => {
  const sales = queryAll(`
    SELECT s.*, COALESCE(c.name, 'Walk-in') as customer_name, c.phone as customer_phone
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.status = 'held' AND s.user_id = ?
    ORDER BY s.created_at DESC
  `, [req.user.id]);

  const result = sales.map(s => {
    const items = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [s.id]);
    return { ...s, items };
  });

  res.json(result);
});

router.patch('/:id/restore', ensureAuthenticated, (req, res) => {
  const sale = queryOne('SELECT * FROM sales WHERE id = ? AND status = ?', [req.params.id, 'held']);
  if (!sale) return res.status(404).json({ error: 'Held order not found' });

  execute('UPDATE sales SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
  saveDb();

  const items = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
  sale.items = items;

  res.json(sale);
});

router.get('/recent', ensureAuthenticated, (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const sales = queryAll(`
    SELECT s.id, s.total, s.payment_method, s.payment_status, s.created_at,
           COALESCE(c.name, 'Walk-in') as customer_name,
           COALESCE(c.id, 0) as customer_id
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.status = 'completed'
    ORDER BY s.created_at DESC
    LIMIT ?
  `, [limit]);

  res.json(sales);
});

router.get('/:id', ensureAuthenticated, (req, res) => {
  const sale = queryOne(`
    SELECT s.*, COALESCE(c.name, 'Walk-in') as customer_name, c.phone as customer_phone
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.id = ?
  `, [req.params.id]);

  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  const items = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
  sale.items = items;

  res.json(sale);
});

router.get('/', ensureAuthenticated, (req, res) => {
  const sales = queryAll(`
    SELECT s.id, s.total, s.tax, s.status, s.created_at,
           s.payment_method, s.payment_status,
           COALESCE(c.name, 'Walk-in') as customer_name,
           COALESCE(c.id, 0) as customer_id
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    ORDER BY s.created_at DESC
  `);

  const result = sales.map(s => {
    const items = queryAll('SELECT product_name, qty, unit FROM sale_items WHERE sale_id = ?', [s.id]);
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const initials = s.customer_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const isDebt = s.payment_status === 'unpaid' || s.payment_status === 'partial';
    return {
      invoice: `#INV-${String(s.id).padStart(4, '0')}`,
      id: s.id,
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      initials,
      name: s.customer_name,
      items: totalItems,
      total: `${s.total.toFixed(2)} DH`,
      payment_method: s.payment_method,
      payment_status: s.payment_status,
      status: isDebt ? 'Debt' : 'Paid',
      statusColor: isDebt ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary',
    };
  });

  res.json(result);
});

export default router;
