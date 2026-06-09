// Load env vars from .env BEFORE any other require reads process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const investmentRoutes = require('./routes/investment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const referralRoutes = require('./routes/referral.routes');
const adminRoutes = require('./routes/admin.routes');
const { startCronJobs, stopCronJobs } = require('./jobs/cron.jobs');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// --- Core middleware ---
// CORS: credentials must be true so the browser sends the httpOnly cookie.
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'NexChain API is running' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Central error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// --- Boot ---
async function start() {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT} (env: ${NODE_ENV})`);
      startCronJobs();
    });

    const shutdown = (signal) => {
      console.log(`[server] ${signal} received, shutting down gracefully...`);
      stopCronJobs();
      server.close(() => {
        console.log('[server] HTTP server closed');
        process.exit(0);
      });
      
      setTimeout(() => {
        console.error('[server] Force shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[fatal] failed to start server:', err.message);
    process.exit(1);
  }
}

start();
