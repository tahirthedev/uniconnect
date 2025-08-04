const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  flagMessage,
  searchMessages
} = require('../controllers/messageController');

const { authenticate } = require('../middleware/auth');
const { messageValidations, commonValidations } = require('../utils/validation');

// All message routes require authentication
router.use(authenticate);

// Get all conversations for current user
router.get('/', getConversations);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Search messages
router.get('/search', [
  require('express-validator').query('q')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  ...commonValidations.pagination,
  require('../utils/validation').handleValidationErrors
], searchMessages);

// Send message to specific user
router.post('/to/:receiverId', messageValidations.send, sendMessage);

// Get conversation with specific user
router.get('/conversation/:userId', messageValidations.getConversation, getConversation);

// Mark specific message as read
router.put('/:messageId/read', [
  commonValidations.objectId('messageId')
], markAsRead);

// Delete message
router.delete('/:messageId', [
  commonValidations.objectId('messageId')
], deleteMessage);

// Flag message for inappropriate content
router.post('/:messageId/flag', [
  commonValidations.objectId('messageId'),
  require('express-validator').body('reason')
    .notEmpty()
    .isLength({ min: 5, max: 200 })
    .withMessage('Flag reason must be between 5 and 200 characters'),
  require('../utils/validation').handleValidationErrors
], flagMessage);

module.exports = router;
