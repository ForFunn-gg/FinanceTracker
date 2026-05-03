require('dotenv').config();

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('   On Render: go to your service → Environment tab → add them.');
  console.error('   Locally: make sure Backend/.env exists with these values.');
  process.exit(1);
}

const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();

connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,           
].filter(Boolean);                

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json({ limit: '10kb' }));

app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (_req, res) =>
  res.json({
    status:  'ok',
    timestamp: new Date().toISOString(),
    env:     process.env.NODE_ENV || 'development',
  })
);

app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
);

app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});