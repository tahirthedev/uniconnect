const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageBody: {
    type: String,
    required: true,
    maxLength: 1000,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachments: [{
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number },
    mimeType: { type: String }
  }],
  // Reference to post if message is about a specific post
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  // Conversation thread identifier
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'deleted'],
    default: 'sent'
  },
  // Read status
  readAt: {
    type: Date,
    default: null
  },
  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    default: null
  },
  flaggedAt: {
    type: Date,
    default: null
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, status: 1 });
messageSchema.index({ relatedPost: 1 });
messageSchema.index({ isFlagged: 1 });

// Create conversation ID based on sender and receiver
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    const participants = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = participants.join('-');
  }
  next();
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  if (this.status !== 'read') {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to flag message
messageSchema.methods.flagMessage = function(reason) {
  this.isFlagged = true;
  this.flagReason = reason;
  this.flaggedAt = new Date();
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(user1Id, user2Id, limit = 50, skip = 0) {
  const participants = [user1Id.toString(), user2Id.toString()].sort();
  const conversationId = participants.join('-');
  
  return this.find({
    conversationId: conversationId,
    isDeleted: false
  })
  .populate('sender', 'name avatar')
  .populate('receiver', 'name avatar')
  .populate('relatedPost', 'title category')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get user's conversations
messageSchema.statics.getUserConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { receiver: mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', mongoose.Types.ObjectId(userId)] },
                  { $ne: ['$status', 'read'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'senderInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.receiver',
        foreignField: '_id',
        as: 'receiverInfo'
      }
    },
    {
      $addFields: {
        otherUser: {
          $cond: [
            { $eq: ['$lastMessage.sender', mongoose.Types.ObjectId(userId)] },
            { $arrayElemAt: ['$receiverInfo', 0] },
            { $arrayElemAt: ['$senderInfo', 0] }
          ]
        }
      }
    },
    {
      $project: {
        conversationId: '$_id',
        lastMessage: 1,
        unreadCount: 1,
        otherUser: {
          _id: 1,
          name: 1,
          avatar: 1
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};

// Static method to mark conversation as read
messageSchema.statics.markConversationAsRead = function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId: conversationId,
      receiver: userId,
      status: { $ne: 'read' }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
};

// Static method to get unread message count for user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    status: { $ne: 'read' },
    isDeleted: false
  });
};

module.exports = mongoose.model('Message', messageSchema);
