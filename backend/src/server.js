const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Core middleware ---
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'NexChain API is running' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);

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
    app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[fatal] failed to start server:', err.message);
    process.exit(1);
  }
}

start();
