require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

// Import configurations
const connectDB = require('./config/database');
const passport = require('./config/passport');
const { reverseGeocode } = require('./utils/locationUtils');
const Post = require('./models/Post');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/bookings');
const uploadRoutes = require('./routes/uploads');

// Initialize Express app
const app = express();
app.set('trust proxy', 1); // 1 = trust the first proxy in the chain
// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001', // Add port 3001 for development
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://www.saydone.net', // New production domain
    'https://saydone.net', // New production domain without www
    'https://uniconnect-production.up.railway.app', // Old production frontend (backup)
    'https://api.saydone.net',
    'http://localhost:5000', // Production backend (for internal calls)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Handle preflight requests
app.options('*', cors());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'UniConnect API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/uploads', uploadRoutes);

// ⚠️ TEMPORARY MIGRATION ENDPOINT - REMOVE AFTER USE ⚠️
app.get('/api/migrate-city-names', async (req, res) => {
  try {
    console.log('🔄 Starting city name migration...');
    
    // Helper function to normalize city names
    const normalizeCity = (city) => {
      if (!city || typeof city !== 'string') return '';
      return city.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    const posts = await Post.find({});
    let updatedCount = 0;
    const changes = [];
    
    for (const post of posts) {
      let needsUpdate = false;
      const updates = {};
      
      // Normalize city name
      if (post.location && post.location.city) {
        const originalCity = post.location.city;
        const normalizedCity = normalizeCity(originalCity);
        
        if (originalCity !== normalizedCity) {
          updates['location.city'] = normalizedCity;
          needsUpdate = true;
          changes.push({
            postId: post._id,
            original: originalCity,
            normalized: normalizedCity,
            field: 'city'
          });
        }
      }
      
      // Normalize address if it looks like a city name (simple heuristic)
      if (post.location && post.location.address) {
        const address = post.location.address.trim();
        
        // If address looks like a simple city name (no numbers, no commas, short)
        if (!/\d/.test(address) && !address.includes(',') && address.split(' ').length <= 3 && address.length < 50) {
          const originalAddress = post.location.address;
          const normalizedAddress = normalizeCity(originalAddress);
          
          if (originalAddress !== normalizedAddress) {
            updates['location.address'] = normalizedAddress;
            needsUpdate = true;
            changes.push({
              postId: post._id,
              original: originalAddress,
              normalized: normalizedAddress,
              field: 'address'
            });
          }
        }
      }
      
      if (needsUpdate) {
        await Post.findByIdAndUpdate(post._id, { $set: updates });
        updatedCount++;
        console.log(`✅ Updated post ${post._id}: ${JSON.stringify(updates)}`);
      }
    }
    
    console.log(`🎉 Migration completed! Updated ${updatedCount} posts.`);
    
    res.json({
      success: true,
      message: `Migration completed successfully. Updated ${updatedCount} posts.`,
      updatedCount,
      changes,
      totalPosts: posts.length
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// Location testing endpoint
app.get('/api/test-location/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    console.log(`🧪 Testing location detection for coordinates: ${lat}, ${lng}`);
    
    const location = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    
    res.json({
      success: true,
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Location test error:', error);
    res.status(500).json({
      success: false,
      message: 'Location detection failed',
      error: error.message
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'UniConnect API v1.0',
    documentation: {
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Register new user',
          'POST /api/auth/login': 'Login user',
          'GET /api/auth/google': 'Google OAuth login',
          'GET /api/auth/me': 'Get current user (requires auth)',
          'PUT /api/auth/profile': 'Update profile (requires auth)',
          'POST /api/auth/logout': 'Logout user (requires auth)'
        },
        posts: {
          'GET /api/posts': 'Get all posts with filters',
          'POST /api/posts': 'Create new post (requires auth)',
          'GET /api/posts/:id': 'Get post by ID',
          'PUT /api/posts/:id': 'Update post (requires auth)',
          'DELETE /api/posts/:id': 'Delete post (requires auth)',
          'POST /api/posts/:id/like': 'Toggle like on post (requires auth)',
          'GET /api/posts/search': 'Search posts'
        },
        messages: {
          'GET /api/messages': 'Get all conversations (requires auth)',
          'POST /api/messages/to/:userId': 'Send message (requires auth)',
          'GET /api/messages/conversation/:userId': 'Get conversation (requires auth)',
          'PUT /api/messages/:id/read': 'Mark message as read (requires auth)',
          'DELETE /api/messages/:id': 'Delete message (requires auth)'
        },
        reports: {
          'POST /api/reports': 'Create report (requires auth)',
          'GET /api/reports': 'Get all reports (moderator/admin only)',
          'GET /api/reports/pending': 'Get pending reports (moderator/admin only)',
          'PUT /api/reports/:id/status': 'Update report status (moderator/admin only)'
        },
        admin: {
          'GET /api/admin/users': 'Get all users (moderator/admin only)',
          'POST /api/admin/users/:id/ban': 'Ban user (moderator/admin only)',
          'PUT /api/admin/users/:id/role': 'Update user role (admin only)',
          'GET /api/admin/analytics': 'Get analytics dashboard (moderator/admin only)',
          'GET /api/admin/flagged-content': 'Get flagged content (moderator/admin only)'
        }
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <token>'
      },
      userRoles: ['user', 'moderator', 'admin'],
      postCategories: ['ridesharing', 'pick-drop', 'jobs', 'buy-sell', 'accommodation', 'currency-exchange']
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 UniConnect API server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
