import { Router } from 'express';
import { queryOne } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

function dateCondition(period) {
  if (period === 'week') return "date(created_at) >= date('now', '-7 days')";
  if (period === 'month') return "date(created_at) >= date('now', '-30 days')";
  if (period === 'year') return "date(created_at) >= date('now', '-365 days')";
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

export default router;
