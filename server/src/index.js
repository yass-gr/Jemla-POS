import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from './passport.js';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import dashboardRoutes from './routes/dashboard.js';
import salesRoutes from './routes/sales.js';
import supplierRoutes from './routes/suppliers.js';
import purchaseRoutes from './routes/purchases.js';
import returnRoutes from './routes/returns.js';
import inventoryRoutes from './routes/inventory.js';
import reportRoutes from './routes/reports.js';
import favoriteRoutes from './routes/favorites.js';
import settingsRoutes from './routes/settings.js';
import usersRoutes from './routes/users.js';
import backupRoutes from './routes/backup.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'jemla-pos-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
