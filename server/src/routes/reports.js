import { Router } from 'express';
import { queryOne } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/summary', ensureAuthenticated, (req, res) => {
  const totalSales = queryOne("SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE status = 'completed'");
  const totalPurchases = queryOne('SELECT COALESCE(SUM(total), 0) as total FROM purchases');
  const totalExpenses = queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
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
