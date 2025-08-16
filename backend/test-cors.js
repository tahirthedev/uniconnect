// Simple CORS test script
const express = require('express');
const cors = require('cors');

const app = express();

// Test the same CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://uniconnect-production.up.railway.app',
    'https://api.saydone.net/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization']
}));

app.options('*', cors());

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    headers: req.headers
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ CORS test server running on port ${PORT}`);
  console.log(`🔧 Allowed origins:`, [
    'http://localhost:3000',
    'https://uniconnect-production.up.railway.app'
  ]);
  console.log(`📊 Test URL: http://localhost:${PORT}/test`);
  process.exit(0);
});
