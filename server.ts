import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth';
import productRoutes from './server/routes/products';
import categoryRoutes from './server/routes/categories';
import orderRoutes from './server/routes/orders';
import inventoryRoutes from './server/routes/inventory';
import userRoutes from './server/routes/users';
import notificationRoutes from './server/routes/notifications';
import reportRoutes from './server/routes/reports';
import auditLogRoutes from './server/routes/auditLogs';
import settingRoutes from './server/routes/settings';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', system: 'FactFruit Fruit Ordering Management System', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/audit-logs', auditLogRoutes);
  app.use('/api/settings', settingRoutes);

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍓 FactFruit Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
