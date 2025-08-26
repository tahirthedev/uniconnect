const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUser,
  getAllPosts,
  updatePostStatus,
  deletePost,
  getFlaggedContent,
  getAnalyticsDashboard,
  updateDailyAnalytics,
  getSystemHealth
} = require('../controllers/adminController');

const { authenticate, adminOnly, moderatorOrAdmin } = require('../middleware/auth');
const { adminValidations, commonValidations, analyticsValidations } = require('../utils/validation');

// All admin routes require authentication
router.use(authenticate);

// System health check (moderators and admins)
router.get('/health', moderatorOrAdmin, getSystemHealth);

// Analytics routes
router.get('/analytics', moderatorOrAdmin, getAnalyticsDashboard);
router.post('/analytics/update-daily', adminOnly, updateDailyAnalytics);

// User management routes
router.get('/users', moderatorOrAdmin, [
  require('express-validator').query('role')
    .optional()
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Invalid role filter'),
  require('express-validator').query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  require('express-validator').query('isBanned')
    .optional()
    .isBoolean()
    .withMessage('isBanned must be boolean'),
  require('express-validator').query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  require('express-validator').query('sort')
    .optional()
    .isIn(['recent', 'active', 'name', 'posts'])
    .withMessage('Invalid sort option'),
  ...commonValidations.pagination,
  require('../utils/validation').handleValidationErrors
], getAllUsers);

router.get('/users/:userId', moderatorOrAdmin, [
  commonValidations.objectId('userId')
], getUserById);

// Admin-only user management
router.put('/users/:userId/role', adminOnly, adminValidations.updateUserRole, updateUserRole);

router.post('/users/:userId/ban', moderatorOrAdmin, adminValidations.banUser, banUser);

router.post('/users/:userId/unban', moderatorOrAdmin, [
  commonValidations.objectId('userId')
], unbanUser);

// Delete user (admin only)
router.delete('/users/:userId', adminOnly, [
  commonValidations.objectId('userId')
], deleteUser);

// Post management routes
router.get('/posts', moderatorOrAdmin, [
  require('express-validator').query('status')
    .optional()
    .isIn(['active', 'inactive', 'expired', 'completed', 'flagged', 'removed'])
    .withMessage('Invalid status filter'),
  require('express-validator').query('category')
    .optional()
    .isIn(['ridesharing', 'pick-drop', 'jobs', 'buy-sell', 'accommodation', 'currency-exchange'])
    .withMessage('Invalid category filter'),
  require('express-validator').query('flagged')
    .optional()
    .isBoolean()
    .withMessage('flagged must be boolean'),
  require('express-validator').query('author')
    .optional()
    .isMongoId()
    .withMessage('Invalid author ID'),
  require('express-validator').query('sort')
    .optional()
    .isIn(['recent', 'views', 'likes', 'flagged'])
    .withMessage('Invalid sort option'),
  ...commonValidations.pagination,
  require('../utils/validation').handleValidationErrors
], getAllPosts);

router.put('/posts/:postId/status', moderatorOrAdmin, [
  commonValidations.objectId('postId'),
  require('express-validator').body('status')
    .isIn(['active', 'inactive', 'flagged', 'removed'])
    .withMessage('Invalid status'),
  require('express-validator').body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason must be less than 200 characters'),
  require('../utils/validation').handleValidationErrors
], updatePostStatus);

// Content moderation routes
router.get('/flagged-content', moderatorOrAdmin, [
  require('express-validator').query('type')
    .optional()
    .isIn(['all', 'posts', 'messages'])
    .withMessage('Invalid content type'),
  ...commonValidations.pagination,
  require('../utils/validation').handleValidationErrors
], getFlaggedContent);

// Delete post (admin only)
router.delete('/posts/:postId', adminOnly, [
  commonValidations.objectId('postId')
], deletePost);

module.exports = router;
