require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create a simple test server that doesn't require MongoDB
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'UniConnect Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'UniConnect Backend API',
    version: '1.0.0',
    description: 'Backend API for UniConnect MVP - University Marketplace & Community Platform',
    endpoints: {
      health: '/health',
      authentication: '/api/auth/*',
      posts: '/api/posts/*',
      messages: '/api/messages/*',
      reports: '/api/reports/*',
      admin: '/api/admin/*'
    },
    features: [
      'Google OAuth Authentication',
      'JWT Token Management', 
      'Role-based Access Control',
      'Posts System (6 categories)',
      'Direct Messaging',
      'Content Moderation',
      'Reporting System',
      'Admin Panel',
      'Analytics Dashboard'
    ],
    categories: [
      'ridesharing',
      'pick-drop', 
      'jobs',
      'marketplace',
      'accommodation',
      'currency'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/health', '/api']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 UniConnect Backend Test Server is running!');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📖 API Info: http://localhost:${PORT}/api`);
  console.log('');
  console.log('✅ This is a basic test server without MongoDB dependency');
  console.log('✅ Use "npm run dev" to start the full backend with all features');
});

module.exports = app;
