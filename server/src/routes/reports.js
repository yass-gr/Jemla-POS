import { Router } from 'express';
import { queryOne, queryAll } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

function dateCondition(period, prefix = '') {
  const col = prefix ? `${prefix}.created_at` : 'created_at';
  if (period === 'week') return `date(${col}) >= date('now', '-7 days')`;
  if (period === 'month') return `date(${col}) >= date('now', '-30 days')`;
  if (period === 'year') return `date(${col}) >= date('now', '-365 days')`;
  return null;
}

router.get('/summary', ensureAuthenticated, (req, res) => {
  const period = req.query.period || 'all';
  const dc = dateCondition(period);
  const salesFilter = dc ? `AND ${dc}` : '';
  const otherFilter = dc ? `WHERE ${dc}` : '';

  const totalSales = queryOne(`SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE status = 'completed' ${salesFilter}`);
  const totalPurchases = queryOne(`SELECT COALESCE(SUM(total), 0) as total FROM purchases ${otherFilter}`);
  const totalExpenses = queryOne(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses ${otherFilter}`);
  const productCount = queryOne('SELECT COUNT(*) as count FROM products');
  const customerCount = queryOne('SELECT COUNT(*) as count FROM customers');

  res.json({
    totalRevenue: totalSales.total,
    totalPurchases: totalPurchases.total,
    totalExpenses: totalExpenses.total,
    grossProfit: totalSales.total - totalPurchases.total,
    productCount: productCount.count,
    customerCount: customerCount.count,
  });
});

router.get('/sales-by-category', ensureAuthenticated, (req, res) => {
  const period = req.query.period || 'all';
  const dc = dateCondition(period, 's');
  const filter = dc ? `AND ${dc}` : '';

  const sql = `
    SELECT p.category, SUM(si.qty * si.price) as revenue, COUNT(*) as sales_count
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.status = 'completed' ${filter}
    GROUP BY p.category
    ORDER BY revenue DESC
  `;
  const rows = queryAll(sql);

  res.json(rows);
});

export default router;
