const mongoose = require('mongoose');

// Daily Analytics Schema
const dailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  users: {
    totalActive: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 }
  },
  posts: {
    total: { type: Number, default: 0 },
    byCategory: {
      ridesharing: { type: Number, default: 0 },
      'pick-drop': { type: Number, default: 0 },
      jobs: { type: Number, default: 0 },
      'buy-sell': { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      'currency-exchange': { type: Number, default: 0 }
    }
  },
  messages: {
    total: { type: Number, default: 0 },
    conversations: { type: Number, default: 0 }
  },
  reports: {
    total: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Monthly Analytics Schema
const monthlyAnalyticsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  users: {
    totalActive: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    retention: { type: Number, default: 0 } // Percentage
  },
  posts: {
    total: { type: Number, default: 0 },
    byCategory: {
      ridesharing: { type: Number, default: 0 },
      'pick-drop': { type: Number, default: 0 },
      jobs: { type: Number, default: 0 },
      'buy-sell': { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      'currency-exchange': { type: Number, default: 0 }
    }
  },
  engagement: {
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    averagePostsPerUser: { type: Number, default: 0 }
  },
  moderation: {
    totalReports: { type: Number, default: 0 },
    resolvedReports: { type: Number, default: 0 },
    bannedUsers: { type: Number, default: 0 },
    flaggedPosts: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for monthly analytics
monthlyAnalyticsSchema.index({ year: 1, month: 1 }, { unique: true });

// User Activity Schema for tracking individual user engagement
const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  activities: {
    postsCreated: { type: Number, default: 0 },
    postsViewed: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    messagesReceived: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    searches: { type: Number, default: 0 },
    reports: { type: Number, default: 0 }
  },
  sessionData: {
    loginCount: { type: Number, default: 0 },
    totalSessionTime: { type: Number, default: 0 }, // in minutes
    lastActive: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Compound index for user activity
userActivitySchema.index({ user: 1, date: 1 }, { unique: true });

// Static methods for DailyAnalytics
dailyAnalyticsSchema.statics.updateDailyStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const User = mongoose.model('User');
  const Post = mongoose.model('Post');
  const Message = mongoose.model('Message');
  const Report = mongoose.model('Report');
  
  // Get daily statistics
  const [
    totalUsers,
    newUsers,
    activeUsers,
    totalPosts,
    postsByCategory,
    totalMessages,
    totalReports,
    resolvedReports
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ 
      createdAt: { 
        $gte: today, 
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    }),
    User.countDocuments({ 
      lastActive: { 
        $gte: today 
      } 
    }),
    Post.countDocuments({ 
      createdAt: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    }),
    Post.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
          }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]),
    Message.countDocuments({ 
      createdAt: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    }),
    Report.countDocuments({ 
      createdAt: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    }),
    Report.countDocuments({ 
      'resolution.resolvedAt': { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    })
  ]);
  
  // Process posts by category
  const categoryStats = {
    ridesharing: 0,
    'pick-drop': 0,
    jobs: 0,
    'buy-sell': 0,
    accommodation: 0,
    'currency-exchange': 0
  };
  
  postsByCategory.forEach(item => {
    if (categoryStats.hasOwnProperty(item._id)) {
      categoryStats[item._id] = item.count;
    }
  });
  
  // Update or create daily analytics
  return this.findOneAndUpdate(
    { date: today },
    {
      users: {
        totalActive: activeUsers,
        newRegistrations: newUsers,
        totalUsers: totalUsers
      },
      posts: {
        total: totalPosts,
        byCategory: categoryStats
      },
      messages: {
        total: totalMessages
      },
      reports: {
        total: totalReports,
        resolved: resolvedReports,
        pending: totalReports - resolvedReports
      }
    },
    { upsert: true, new: true }
  );
};

// Static methods for MonthlyAnalytics
monthlyAnalyticsSchema.statics.updateMonthlyStats = async function(year, month) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
  const User = mongoose.model('User');
  const Post = mongoose.model('Post');
  const Message = mongoose.model('Message');
  const Report = mongoose.model('Report');
  
  // Get monthly statistics
  const [
    totalUsers,
    newUsers,
    activeUsers,
    totalPosts,
    postsByCategory,
    totalMessages,
    totalViews,
    totalLikes,
    totalReports,
    resolvedReports,
    bannedUsers,
    flaggedPosts
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    }),
    User.countDocuments({ 
      lastActive: { $gte: startOfMonth } 
    }),
    Post.countDocuments({ 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    }),
    Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]),
    Message.countDocuments({ 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    }),
    Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]),
    Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $project: {
          likeCount: { $size: '$likes' }
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$likeCount' }
        }
      }
    ]),
    Report.countDocuments({ 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    }),
    Report.countDocuments({ 
      'resolution.resolvedAt': { $gte: startOfMonth, $lte: endOfMonth } 
    }),
    User.countDocuments({ 
      isBanned: true,
      bannedAt: { $gte: startOfMonth, $lte: endOfMonth }
    }),
    Post.countDocuments({ 
      'moderation.isFlagged': true,
      'moderation.flaggedAt': { $gte: startOfMonth, $lte: endOfMonth }
    })
  ]);
  
  // Process posts by category
  const categoryStats = {
    ridesharing: 0,
    'pick-drop': 0,
    jobs: 0,
    'buy-sell': 0,
    accommodation: 0,
    'currency-exchange': 0
  };
  
  postsByCategory.forEach(item => {
    if (categoryStats.hasOwnProperty(item._id)) {
      categoryStats[item._id] = item.count;
    }
  });
  
  const viewsData = totalViews[0] || { totalViews: 0 };
  const likesData = totalLikes[0] || { totalLikes: 0 };
  
  // Calculate average posts per user
  const averagePostsPerUser = activeUsers > 0 ? totalPosts / activeUsers : 0;
  
  // Update or create monthly analytics
  return this.findOneAndUpdate(
    { year: year, month: month },
    {
      users: {
        totalActive: activeUsers,
        newRegistrations: newUsers,
        totalUsers: totalUsers,
        retention: activeUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
      },
      posts: {
        total: totalPosts,
        byCategory: categoryStats
      },
      engagement: {
        totalViews: viewsData.totalViews,
        totalLikes: likesData.totalLikes,
        totalMessages: totalMessages,
        averagePostsPerUser: averagePostsPerUser
      },
      moderation: {
        totalReports: totalReports,
        resolvedReports: resolvedReports,
        bannedUsers: bannedUsers,
        flaggedPosts: flaggedPosts
      }
    },
    { upsert: true, new: true }
  );
};

// Static method for UserActivity to track user activity
userActivitySchema.statics.logActivity = async function(userId, activityType, count = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const updateField = `activities.${activityType}`;
  
  return this.findOneAndUpdate(
    { user: userId, date: today },
    { 
      $inc: { [updateField]: count },
      $set: { 'sessionData.lastActive': new Date() }
    },
    { upsert: true, new: true }
  );
};

const DailyAnalytics = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
const MonthlyAnalytics = mongoose.model('MonthlyAnalytics', monthlyAnalyticsSchema);
const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = {
  DailyAnalytics,
  MonthlyAnalytics,
  UserActivity
};
