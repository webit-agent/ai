import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { startScheduler } from './jobs/scheduler';
import pool from './db/index';

import authRoutes from './routes/auth';
import competitorRoutes from './routes/competitors';
import productRoutes from './routes/trackedProducts';
import priceHistoryRoutes from './routes/priceHistory';
import alertRoutes from './routes/alerts';
import insightRoutes from './routes/insights';
import settingsRoutes from './routes/settings';
import comparisonRoutes from './routes/comparison';
import telegramRoutes from './routes/telegram';
import reportRoutes from './routes/reports';
import snapshotsRoute from './routes/contentSnapshots';
import { initTelegramBot } from './tools/telegramBot';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/products', productRoutes);
app.use('/api', priceHistoryRoutes); // handles /api/products/:id/history
app.use('/api/alerts', alertRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/snapshots', snapshotsRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
  initTelegramBot();
});
