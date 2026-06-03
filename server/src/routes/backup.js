import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureAuthenticated, ensureRole } from '../middleware/auth.js';
import { saveDb } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'jemla.db');

const router = Router();

router.get('/', ensureAuthenticated, ensureRole('admin'), (req, res) => {
  saveDb();
  res.download(DB_PATH, `jemla-backup-${new Date().toISOString().slice(0, 10)}.db`);
});

export default router;
