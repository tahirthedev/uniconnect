const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token. User not found.' 
        });
      }

      if (user.isBanned) {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is banned.', 
          banReason: user.banReason 
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is inactive.' 
        });
      }

      // Update last active timestamp
      user.updateLastActive().catch(err => console.log('Error updating last active:', err));

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token.' 
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired.' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

// Optional Authentication (for public endpoints that can benefit from user info)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && !user.isBanned && user.isActive) {
        req.user = user;
        user.updateLastActive().catch(err => console.log('Error updating last active:', err));
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

// Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Admin Authorization
const adminOnly = authorize('admin');

// Moderator or Admin Authorization
const moderatorOrAdmin = authorize('moderator', 'admin');

// Check if user owns resource or is admin/moderator
const ownerOrModerator = (resourceField = 'author') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Authentication required.' 
      });
    }

    // Admin and moderators can access anything
    if (['admin', 'moderator'].includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = req[resourceField] || req.body[resourceField] || req.params[resourceField];
    
    if (!resourceOwnerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resource owner identification missing.' 
      });
    }

    if (req.user._id.toString() !== resourceOwnerId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};

// Rate limiting by user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated requests
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    requests.set(userId, validRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, timestamps] of requests.entries()) {
        const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
        if (validTimestamps.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, validTimestamps);
        }
      }
    }

    next();
  };
};

// Validate user status (not banned, active)
const validateUserStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (req.user.isBanned) {
    return res.status(403).json({ 
      success: false, 
      message: 'Your account has been banned.', 
      banReason: req.user.banReason,
      bannedAt: req.user.bannedAt
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({ 
      success: false, 
      message: 'Your account is inactive. Please contact support.' 
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  moderatorOrAdmin,
  ownerOrModerator,
  userRateLimit,
  validateUserStatus
};
