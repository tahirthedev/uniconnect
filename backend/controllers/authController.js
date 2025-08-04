const User = require('../models/User');
const { createTokenResponse } = require('../utils/jwt');
const { UserActivity } = require('../models/Analytics');

// Google OAuth success callback
const googleAuthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=authentication_failed`);
    }

    // Log user activity
    await UserActivity.logActivity(req.user._id, 'loginCount');

    const tokenResponse = createTokenResponse(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${tokenResponse.token}&refresh=${tokenResponse.refreshToken}`;
    res.redirect(frontendUrl);

  } catch (error) {
    console.error('Google auth success error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=server_error`);
  }
};

// Google OAuth failure callback
const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
};

// Register new user (email/phone)
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { phone: phone }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Create new user
    const userData = {
      name,
      role: 'user',
      isActive: true
    };

    if (email) userData.email = email;
    if (phone) userData.phone = phone;
    if (password) userData.password = password;

    const user = new User(userData);
    await user.save();

    // Log user activity
    await UserActivity.logActivity(user._id, 'loginCount');

    const tokenResponse = createTokenResponse(user);
    res.status(201).json(tokenResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user (email/phone + password)
const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password (if user has password set)
    if (!user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned',
        banReason: user.banReason
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Log user activity
    await UserActivity.logActivity(user._id, 'loginCount');

    const tokenResponse = createTokenResponse(user);
    res.json(tokenResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.profile
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar, preferences } = req.body;
    const userId = req.user._id;

    // Check if email/phone is already taken by another user
    if (email || phone) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          { email: email },
          { phone: phone }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or phone number is already taken by another user'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    if (user.password && !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout user (client-side token removal)
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(400).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || user.isBanned || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account inactive'
        });
      }

      const tokenResponse = createTokenResponse(user);
      res.json(tokenResponse);

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  googleAuthSuccess,
  googleAuthFailure,
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  refreshToken
};
