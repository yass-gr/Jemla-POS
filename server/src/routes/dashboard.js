import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/stats', ensureAuthenticated, (req, res) => {
  const todaySales = queryOne(`
    SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
    FROM sales WHERE date(created_at) = date('now')
  `);

  const pendingDebts = queryOne(`
    SELECT COALESCE(SUM(debt_balance), 0) as total FROM customers
  `);

  const overdueCount = queryOne(`
    SELECT COUNT(*) as count FROM customers WHERE debt_balance > 0
  `);

  const lowStock = queryOne(`
    SELECT COUNT(*) as count FROM products WHERE stock < 10
  `);

  res.json({
    todaySales: todaySales.total,
    todayTransactions: todaySales.count,
    pendingDebts: pendingDebts.total,
    overdueAccounts: overdueCount.count,
    lowStockItems: lowStock.count,
  });
});

router.get('/sales-trend', ensureAuthenticated, (req, res) => {
  const period = req.query.period || 'week';
  const trend = [];

  if (period === 'year' || period === 'all') {
    const range = period === 'year' ? 365 : 99999;
    const months = queryAll(`
      SELECT strftime('%Y-%m', created_at) as label,
             COALESCE(SUM(total), 0) as total
      FROM sales WHERE status = 'completed'
        AND date(created_at) >= date('now', '-' || ? || ' days')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY label ASC
    `, [range]);

    const prevMonths = queryAll(`
      SELECT strftime('%Y-%m', created_at) as label,
             COALESCE(SUM(total), 0) as total
      FROM sales WHERE status = 'completed'
        AND date(created_at) >= date('now', '-' || ? || ' days')
        AND date(created_at) < date('now', '-' || ? || ' days')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY label ASC
    `, [range * 2, range]);

    const prevMap = {};
    prevMonths.forEach(m => { prevMap[m.label] = m.total; });

    months.forEach((m) => {
      const date = new Date(m.label + '-01');
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      trend.push({
        day: label,
        value: Math.round(m.total / 1000 * 10) / 10,
        previous: Math.round((prevMap[m.label] || 0) / 1000 * 10) / 10,
      });
    });
  } else {
    const days = period === 'month' ? 30 : 7;
    for (let i = days - 1; i >= 0; i--) {
      const thisPeriod = queryOne(`
        SELECT COALESCE(SUM(total), 0) as total
        FROM sales WHERE date(created_at) = date('now', '-' || ? || ' days')
      `, [i]);
      const prevPeriod = queryOne(`
        SELECT COALESCE(SUM(total), 0) as total
        FROM sales WHERE date(created_at) = date('now', '-' || ? || ' days')
      `, [i + days]);
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = period === 'month'
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { weekday: 'short' });
      trend.push({
        day: dayName,
        value: Math.round(thisPeriod.total / 1000 * 10) / 10,
        previous: Math.round(prevPeriod.total / 1000 * 10) / 10,
      });
    }
  }
  res.json(trend);
});

router.get('/top-products', ensureAuthenticated, (req, res) => {
  const period = req.query.period || 'all';
  let filter = '';
  if (period === 'week') filter = "AND date(s.created_at) >= date('now', '-7 days')";
  else if (period === 'month') filter = "AND date(s.created_at) >= date('now', '-30 days')";
  else if (period === 'year') filter = "AND date(s.created_at) >= date('now', '-365 days')";

  const products = queryAll(`
    SELECT si.product_name as name, COUNT(*) as sales, si.price,
           p.stock, p.image_url as img,
           COALESCE(SUM(si.qty * si.price), 0) as revenue
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.status = 'completed' ${filter}
    GROUP BY si.product_id
    ORDER BY revenue DESC
    LIMIT 4
  `);
  res.json(products);
});

router.get('/top-customers', ensureAuthenticated, (req, res) => {
  const customer = queryOne(`
    SELECT c.id, c.name, c.phone, c.debt_balance,
           COUNT(s.id) as total_orders,
           COALESCE(SUM(s.total), 0) as total_spent
    FROM customers c
    JOIN sales s ON s.customer_id = c.id
    WHERE s.status = 'completed'
    GROUP BY c.id
    ORDER BY total_spent DESC
    LIMIT 1
  `);
  res.json(customer || null);
});

router.get('/recent-transactions', ensureAuthenticated, (req, res) => {
  const transactions = queryAll(`
    SELECT s.id, s.created_at, COALESCE(c.name, 'Walk-in') as customer,
           s.total, s.status,
           (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as items
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    ORDER BY s.created_at DESC
    LIMIT 5
  `);
  res.json(transactions.map(t => ({
    ...t,
    invoice: `#POS-${String(t.id).padStart(5, '0')}`,
    date: formatRelativeDate(t.created_at),
  })));
});

function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 60) return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  if (hours < 24 && date.getDate() === now.getDate()) return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  if (hours < 48) return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default router;
