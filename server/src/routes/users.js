import { Router } from 'express';
import bcrypt from 'bcrypt';
import { ensureAuthenticated, ensureRole } from '../middleware/auth.js';
import { getDb, queryAll, queryOne, execute, saveDb, getLastInsertId } from '../db.js';

const router = Router();

router.get('/', ensureAuthenticated, ensureRole('admin'), (req, res) => {
  const users = queryAll('SELECT id, username, name, role, created_at FROM users ORDER BY id');
  res.json(users);
});

router.post('/', ensureAuthenticated, ensureRole('admin'), (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }
  const existing = queryOne('SELECT id FROM users WHERE username = ?', [username]);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const hash = bcrypt.hashSync(password, 10);
  execute('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
    [username, hash, name, role || 'cashier']);
  saveDb();
  const id = getLastInsertId();
  const user = queryOne('SELECT id, username, name, role, created_at FROM users WHERE id = ?', [id]);
  res.status(201).json(user);
});

router.put('/:id', ensureAuthenticated, ensureRole('admin'), (req, res) => {
  const { id } = req.params;
  const { username, name, role } = req.body;
  const existing = queryOne('SELECT id FROM users WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  if (username) {
    const dup = queryOne('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
    if (dup) return res.status(409).json({ error: 'Username already exists' });
  }
  execute('UPDATE users SET username = COALESCE(?, username), name = COALESCE(?, name), role = COALESCE(?, role) WHERE id = ?',
    [username || null, name || null, role || null, id]);
  saveDb();
  const user = queryOne('SELECT id, username, name, role, created_at FROM users WHERE id = ?', [id]);
  res.json(user);
});

router.delete('/:id', ensureAuthenticated, ensureRole('admin'), (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  const existing = queryOne('SELECT id FROM users WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  execute('DELETE FROM users WHERE id = ?', [id]);
  saveDb();
  res.json({ message: 'User deleted' });
});

router.put('/:id/password', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (Number(id) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: 'Password must be at least 3 characters' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  execute('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
  saveDb();
  res.json({ message: 'Password updated' });
});

router.put('/password/me', ensureAuthenticated, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: 'Password must be at least 3 characters' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  execute('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
  saveDb();
  res.json({ message: 'Password updated' });
});

export default router;
