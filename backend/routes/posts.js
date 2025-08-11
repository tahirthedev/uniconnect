const express = require('express');
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  searchPosts,
  getUserPosts,
  getUserStats
} = require('../controllers/postController');

const { authenticate, optionalAuth, ownerOrModerator } = require('../middleware/auth');
const { postValidations, commonValidations } = require('../utils/validation');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, postValidations.search, getPosts);
router.get('/search', optionalAuth, postValidations.search, searchPosts);

// Current user routes (must be above /:postId to avoid conflicts)
router.get('/my-posts', authenticate, getUserPosts);
router.get('/my-stats', authenticate, getUserStats);

// User-specific routes
router.get('/user/:userId', optionalAuth, [
  commonValidations.objectId('userId'),
  ...commonValidations.pagination
], getUserPosts);

// Dynamic route for individual posts (must be after specific routes)
router.get('/:postId', optionalAuth, commonValidations.objectId('postId'), getPostById);

// Protected routes
router.post('/', authenticate, (req, res, next) => {
  console.log('🔥 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));
  console.log('🔥 REQUEST HEADERS:', req.headers);
  next();
}, postValidations.create, createPost);

router.put('/:postId', authenticate, [
  commonValidations.objectId('postId'),
  ...postValidations.update
], updatePost);

router.delete('/:postId', authenticate, [
  commonValidations.objectId('postId')
], deletePost);

// Like/Unlike post
router.post('/:postId/like', authenticate, [
  commonValidations.objectId('postId')
], toggleLike);

module.exports = router;
