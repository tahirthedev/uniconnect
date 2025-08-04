const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Report = require('../models/Report');
const { DailyAnalytics, MonthlyAnalytics, UserActivity } = require('../models/Analytics');

// Get all users with filters
const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      isActive,
      isBanned,
      search,
      page = 1,
      limit = 20,
      sort = 'recent'
    } = req.query;

    const filters = {};

    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isBanned !== undefined) filters.isBanned = isBanned === 'true';

    if (search) {
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'active':
        sortOptions = { lastActive: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'posts':
        sortOptions = { totalPosts: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalCount] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user details by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's recent activity
    const [recentPosts, recentMessages, recentReports] = await Promise.all([
      Post.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title category status createdAt'),
      Message.find({ 
        $or: [{ sender: userId }, { receiver: userId }] 
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('messageBody createdAt sender receiver')
        .populate('sender receiver', 'name'),
      Report.find({ reporter: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('reason status createdAt')
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        recentActivity: {
          posts: recentPosts,
          messages: recentMessages,
          reports: recentReports
        }
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Prevent users from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    // Only admins can create other admins
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can assign admin role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Ban user
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Prevent users from banning themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban yourself'
      });
    }

    const userToBan = await User.findById(userId);

    if (!userToBan) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent banning other admins (unless current user is admin)
    if (userToBan.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    const bannedUser = await User.banUser(userId, reason, req.user._id);

    res.json({
      success: true,
      message: 'User banned successfully',
      user: {
        id: bannedUser._id,
        name: bannedUser.name,
        isBanned: bannedUser.isBanned,
        banReason: bannedUser.banReason,
        bannedAt: bannedUser.bannedAt
      }
    });

  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Unban user
const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'User is not banned'
      });
    }

    const unbannedUser = await User.unbanUser(userId);

    res.json({
      success: true,
      message: 'User unbanned successfully',
      user: {
        id: unbannedUser._id,
        name: unbannedUser.name,
        isBanned: unbannedUser.isBanned
      }
    });

  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unban user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all posts with admin filters
const getAllPosts = async (req, res) => {
  try {
    const {
      status,
      category,
      flagged,
      author,
      page = 1,
      limit = 20,
      sort = 'recent'
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (flagged !== undefined) filters['moderation.isFlagged'] = flagged === 'true';
    if (author) filters.author = author;

    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'views':
        sortOptions = { views: -1 };
        break;
      case 'likes':
        sortOptions = { 'likes.length': -1 };
        break;
      case 'flagged':
        sortOptions = { 'moderation.flaggedAt': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, totalCount] = await Promise.all([
      Post.find(filters)
        .populate('author', 'name email avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update post status (approve/reject flagged posts)
const updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status, reason } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const updateData = {
      status,
      'moderation.isReviewed': true,
      'moderation.reviewedBy': req.user._id,
      'moderation.reviewedAt': new Date()
    };

    if (reason) {
      updateData['moderation.flagReason'] = reason;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      message: `Post ${status} successfully`,
      post: updatedPost
    });

  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get flagged content
const getFlaggedContent = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let flaggedPosts = [];
    let flaggedMessages = [];

    if (type === 'all' || type === 'posts') {
      flaggedPosts = await Post.find({ 'moderation.isFlagged': true })
        .populate('author', 'name email')
        .sort({ 'moderation.flaggedAt': -1 })
        .skip(type === 'posts' ? skip : 0)
        .limit(type === 'posts' ? parseInt(limit) : parseInt(limit) / 2);
    }

    if (type === 'all' || type === 'messages') {
      flaggedMessages = await Message.find({ isFlagged: true })
        .populate('sender receiver', 'name email')
        .sort({ flaggedAt: -1 })
        .skip(type === 'messages' ? skip : 0)
        .limit(type === 'messages' ? parseInt(limit) : parseInt(limit) / 2);
    }

    const totalCount = await Promise.all([
      type === 'all' || type === 'posts' ? Post.countDocuments({ 'moderation.isFlagged': true }) : 0,
      type === 'all' || type === 'messages' ? Message.countDocuments({ isFlagged: true }) : 0
    ]);

    const total = totalCount[0] + totalCount[1];
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      flaggedContent: {
        posts: flaggedPosts,
        messages: flaggedMessages
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get flagged content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get analytics dashboard data
const getAnalyticsDashboard = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalPosts,
      activePosts,
      flaggedPosts,
      totalMessages,
      pendingReports,
      dailyAnalytics
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true, isBanned: false }),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments({}),
      Post.countDocuments({ status: 'active' }),
      Post.countDocuments({ 'moderation.isFlagged': true }),
      Message.countDocuments({}),
      Report.countDocuments({ status: 'pending' }),
      DailyAnalytics.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }).limit(30)
    ]);

    // Get posts by category
    const postsByCategory = await Post.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get user growth data
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          activeUsers,
          bannedUsers,
          totalPosts,
          activePosts,
          flaggedPosts,
          totalMessages,
          pendingReports
        },
        postsByCategory,
        userGrowth,
        dailyAnalytics
      }
    });

  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update daily analytics manually
const updateDailyAnalytics = async (req, res) => {
  try {
    const analytics = await DailyAnalytics.updateDailyStats();

    res.json({
      success: true,
      message: 'Daily analytics updated successfully',
      analytics
    });

  } catch (error) {
    console.error('Update daily analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update daily analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// System health check
const getSystemHealth = async (req, res) => {
  try {
    const checks = {
      database: false,
      diskSpace: true, // Placeholder
      memory: true,    // Placeholder
      uptime: process.uptime()
    };

    // Test database connection
    try {
      await User.findOne().limit(1);
      checks.database = true;
    } catch (error) {
      checks.database = false;
    }

    const isHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : true
    );

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      health: isHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System health check error:', error);
    res.status(503).json({
      success: false,
      health: 'unhealthy',
      error: 'Health check failed'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  banUser,
  unbanUser,
  getAllPosts,
  updatePostStatus,
  getFlaggedContent,
  getAnalyticsDashboard,
  updateDailyAnalytics,
  getSystemHealth
};
