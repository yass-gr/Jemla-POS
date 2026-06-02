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
  const { customer_id, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  execute(
    'INSERT INTO sales (customer_id, user_id, total, tax, status) VALUES (?, ?, ?, ?, ?)',
    [customer_id || null, req.user.id, total, tax, 'completed']
  );
  const saleId = getLastInsertId();

  const stmt = getDb().prepare(
    'INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const item of items) {
    stmt.bind([saleId, item.product_id, item.product_name, item.price, item.qty, item.unit]);
    stmt.step();
    stmt.reset();

    execute('UPDATE products SET stock = stock - ?, updated_at = datetime(\'now\') WHERE id = ?', [item.qty, item.product_id]);
    execute('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)', [item.product_id, -item.qty, 'sale']);
  }
  stmt.free();

  if (customer_id) {
    execute('UPDATE customers SET debt_balance = debt_balance + ?, updated_at = datetime(\'now\') WHERE id = ?', [total, customer_id]);
  }

  saveDb();

  const sale = queryOne('SELECT * FROM sales WHERE id = ?', [saleId]);
  const saleItems = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);
  sale.items = saleItems;

  res.status(201).json(sale);
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
    return {
      invoice: `#INV-${String(s.id).padStart(4, '0')}`,
      id: s.id,
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      initials,
      name: s.customer_name,
      items: `${Math.ceil(totalItems)} Items`,
      total: `${s.total.toFixed(2)} DH`,
      status: s.customer_id > 0 && s.total > 0 ? 'Debt' : 'Paid',
      statusColor: s.customer_id > 0 && s.total > 0 ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary',
    };
  });

  res.json(result);
});

export default router;
