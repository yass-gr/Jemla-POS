import { Router } from 'express';
import { queryAll } from '../db.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const products = queryAll('SELECT id, name, category, price, unit, stock, updated_at FROM products ORDER BY stock ASC');
  res.json(products);
});

router.get('/log', ensureAuthenticated, (req, res) => {
  const log = queryAll(`
    SELECT l.*, p.name as product_name
    FROM inventory_log l
    LEFT JOIN products p ON l.product_id = p.id
    ORDER BY l.created_at DESC
    LIMIT 50
  `);
  res.json(log);
});

export default router;
