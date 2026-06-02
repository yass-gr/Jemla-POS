export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

export function ensureRole(...roles) {
  return (req, res, next) => {
    if (req.isAuthenticated() && roles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  };
}
