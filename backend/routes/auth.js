const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  googleAuthSuccess,
  googleAuthFailure,
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  refreshToken
} = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');
const { userValidations } = require('../utils/validation');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  googleAuthSuccess
);

router.get('/google/failure', googleAuthFailure);

// Local authentication routes
router.post('/register', userValidations.register, register);

router.post('/login', [
  userValidations.userValidations?.login || [
    require('express-validator').body('emailOrPhone')
      .notEmpty()
      .withMessage('Email or phone is required'),
    require('express-validator').body('password')
      .notEmpty()
      .withMessage('Password is required'),
    require('../utils/validation').handleValidationErrors
  ]
], login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, userValidations.updateProfile, updateProfile);

router.put('/password', authenticate, [
  require('express-validator').body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  require('express-validator').body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  require('../utils/validation').handleValidationErrors
], changePassword);

router.post('/logout', authenticate, logout);

// Token refresh
router.post('/refresh', [
  require('express-validator').body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  require('../utils/validation').handleValidationErrors
], refreshToken);

module.exports = router;
