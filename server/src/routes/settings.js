import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/auth.js';
import { queryAll, queryOne, execute, saveDb } from '../db.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const rows = queryAll('SELECT key, value FROM settings');
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put('/', ensureAuthenticated, (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    const existing = queryOne('SELECT key FROM settings WHERE key = ?', [key]);
    if (existing) {
      execute('UPDATE settings SET value = ? WHERE key = ?', [String(value), key]);
    } else {
      execute('INSERT INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }
  }
  saveDb();
  const rows = queryAll('SELECT key, value FROM settings');
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

export default router;
