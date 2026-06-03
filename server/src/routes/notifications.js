import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const thresholdSetting = queryOne("SELECT value FROM settings WHERE key = 'stock_threshold'");
  const threshold = parseInt(thresholdSetting?.value || '10', 10);

  const lowStock = queryAll(`
    SELECT id, name, stock, unit, category
    FROM products WHERE stock < ? AND stock > 0
    ORDER BY stock ASC LIMIT 5
  `, [threshold]);

  const outOfStock = queryAll(`
    SELECT id, name, unit, category
    FROM products WHERE stock <= 0
    ORDER BY name ASC LIMIT 5
  `);

  const debtors = queryAll(`
    SELECT id, name, debt_balance
    FROM customers WHERE debt_balance > 0
    ORDER BY debt_balance DESC LIMIT 5
  `);

  const heldSales = queryAll(`
    SELECT id, total, created_at,
      COALESCE((SELECT name FROM customers WHERE id = sales.customer_id), 'Walk-in') as customer
    FROM sales WHERE status = 'held'
    ORDER BY created_at DESC LIMIT 3
  `);

  res.json({ lowStock, outOfStock, debtors, heldSales });
});

export default router;
