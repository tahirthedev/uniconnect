const Message = require('../models/Message');
const User = require('../models/User');
const Post = require('../models/Post');
const { UserActivity } = require('../models/Analytics');
const { detectFlaggedContent, shouldAutoFlag } = require('../utils/moderation');

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { messageBody, messageType = 'text', relatedPost, attachments } = req.body;
    const senderId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if receiver is active and not banned
    if (!receiver.isActive || receiver.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to inactive or banned user'
      });
    }

    // Check if sender is trying to message themselves
    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    // Content moderation check
    const contentAnalysis = detectFlaggedContent(messageBody);

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      messageBody,
      messageType,
      status: 'sent'
    };

    // Optional fields
    if (relatedPost) {
      // Verify the post exists
      const post = await Post.findById(relatedPost);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Related post not found'
        });
      }
      messageData.relatedPost = relatedPost;
    }

    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    // Apply moderation results
    if (contentAnalysis.isFlagged && shouldAutoFlag(contentAnalysis)) {
      messageData.isFlagged = true;
      messageData.flagReason = 'Auto-flagged for suspicious content';
      messageData.flaggedAt = new Date();
    }

    const message = new Message(messageData);
    await message.save();

    // Populate sender and receiver info
    await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' },
      { path: 'relatedPost', select: 'title category' }
    ]);

    // Update user message counts
    await Promise.all([
      User.findByIdAndUpdate(senderId, { $inc: { totalMessages: 1 } }),
      UserActivity.logActivity(senderId, 'messagesSent'),
      UserActivity.logActivity(receiverId, 'messagesReceived')
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
      moderation: contentAnalysis.isFlagged ? {
        flagged: true,
        severity: contentAnalysis.severity,
        message: 'Your message has been flagged for review due to potentially inappropriate content.'
      } : null
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user._id;

    // Check if the other user exists
    const otherUser = await User.findById(userId).select('name avatar');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.getConversation(
      currentUserId,
      userId,
      parseInt(limit),
      skip
    );

    // Mark messages as read for the current user
    await Message.markConversationAsRead(
      messages.length > 0 ? messages[0].conversationId : `${[currentUserId, userId].sort().join('-')}`,
      currentUserId
    );

    // Reverse to show oldest first
    const sortedMessages = messages.reverse();

    res.json({
      success: true,
      conversation: {
        otherUser,
        messages: sortedMessages,
        pagination: {
          currentPage: parseInt(page),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.getUserConversations(userId);

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only receiver can mark message as read
    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their own messages, or admin/moderator
    if (message.sender.toString() !== userId.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.softDelete(userId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Flag message (for reporting inappropriate content)
const flagMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // User can only flag messages they received
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only flag messages sent to you'
      });
    }

    await message.flagMessage(reason);

    res.json({
      success: true,
      message: 'Message flagged successfully'
    });

  } catch (error) {
    console.error('Flag message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search messages (for current user's conversations)
const searchMessages = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      messageBody: new RegExp(q.trim(), 'i'),
      isDeleted: false
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('relatedPost', 'title category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalCount = await Message.countDocuments({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      messageBody: new RegExp(q.trim(), 'i'),
      isDeleted: false
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      searchQuery: q
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  flagMessage,
  searchMessages
};
