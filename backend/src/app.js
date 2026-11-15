import express from 'express';
import path from 'node:path';
import { pool } from './db.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import pointsRoutes from './modules/points/points.routes.js';
import rewardsRoutes from './modules/rewards/rewards.routes.js';
import redemptionsRoutes from './modules/redemptions/redemptions.routes.js';

const app = express();
app.use(express.json());

// Teste rápido: confirma que a API e o banco estão no ar
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', database: 'ok' });
  } catch (err) {
    res.status(500).json({ api: 'ok', database: 'erro', detail: err.message });
  }
});

// Cada módulo define o caminho completo dos seus endpoints (ex.: /rewards, /admin/rewards)
app.use('/api', authRoutes);
app.use('/api', pointsRoutes);
app.use('/api', rewardsRoutes);
app.use('/api', redemptionsRoutes);
app.use('/api', notFound);

// O Express também entrega o front-end
app.use(express.static(path.join(import.meta.dirname, '../../frontend')));

app.use(errorHandler);

export default app;
