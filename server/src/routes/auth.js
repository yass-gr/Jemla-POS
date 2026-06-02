import { Router } from 'express';
import passport from 'passport';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', ensureAuthenticated, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, name: req.user.name, role: req.user.role });
});

export default router;
