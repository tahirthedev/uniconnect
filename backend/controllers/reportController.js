const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const Message = require('../models/Message');
const { UserActivity } = require('../models/Analytics');

// Create a new report
const createReport = async (req, res) => {
  try {
    const {
      reportType,
      reportedPost,
      reportedUser,
      reportedMessage,
      reason,
      description,
      evidence
    } = req.body;

    const reporterId = req.user._id;

    // Validate that the reported content exists
    let reportedContent = null;
    
    switch (reportType) {
      case 'post':
        reportedContent = await Post.findById(reportedPost);
        if (!reportedContent) {
          return res.status(404).json({
            success: false,
            message: 'Reported post not found'
          });
        }
        break;
        
      case 'user':
        reportedContent = await User.findById(reportedUser);
        if (!reportedContent) {
          return res.status(404).json({
            success: false,
            message: 'Reported user not found'
          });
        }
        // Users cannot report themselves
        if (reportedUser === reporterId.toString()) {
          return res.status(400).json({
            success: false,
            message: 'You cannot report yourself'
          });
        }
        break;
        
      case 'message':
        reportedContent = await Message.findById(reportedMessage);
        if (!reportedContent) {
          return res.status(404).json({
            success: false,
            message: 'Reported message not found'
          });
        }
        // Only receiver can report a message
        if (reportedContent.receiver.toString() !== reporterId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You can only report messages sent to you'
          });
        }
        break;
    }

    // Check if user has already reported this content
    const existingReport = await Report.findOne({
      reporter: reporterId,
      reportType,
      ...(reportType === 'post' && { reportedPost }),
      ...(reportType === 'user' && { reportedUser }),
      ...(reportType === 'message' && { reportedMessage })
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content'
      });
    }

    const reportData = {
      reporter: reporterId,
      reportType,
      reason,
      description,
      status: 'pending'
    };

    // Add type-specific fields
    if (reportType === 'post') reportData.reportedPost = reportedPost;
    if (reportType === 'user') reportData.reportedUser = reportedUser;
    if (reportType === 'message') reportData.reportedMessage = reportedMessage;

    if (evidence && evidence.length > 0) {
      reportData.evidence = evidence;
    }

    const report = new Report(reportData);
    await report.save();

    // Populate the report with referenced data
    await report.populate([
      { path: 'reporter', select: 'name email' },
      { path: 'reportedUser', select: 'name email' },
      { path: 'reportedPost', select: 'title category' },
      { path: 'reportedMessage', select: 'messageBody' }
    ]);

    // Log user activity
    await UserActivity.logActivity(reporterId, 'reports');

    // Check for similar reports and auto-escalate if needed
    const similarReports = await Report.findSimilarReports(reportData);
    
    if (similarReports.length >= 3) {
      await report.escalate('Multiple similar reports detected - auto-escalated');
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        status: report.status,
        priority: report.priority,
        createdAt: report.createdAt
      }
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all reports (admin/moderator only)
const getAllReports = async (req, res) => {
  try {
    const {
      status,
      priority,
      reportType,
      reason,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (reportType) filters.reportType = reportType;
    if (reason) filters.reason = reason;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, totalCount] = await Promise.all([
      Report.find(filters)
        .populate('reporter', 'name email')
        .populate('reportedUser', 'name email')
        .populate('reportedPost', 'title category')
        .populate('reportedMessage', 'messageBody')
        .populate('reviewedBy', 'name')
        .sort({ priority: -1, createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get pending reports (admin/moderator only)
const getPendingReports = async (req, res) => {
  try {
    const reports = await Report.getPendingReports();

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate('reporter', 'name email avatar')
      .populate('reportedUser', 'name email avatar')
      .populate('reportedPost', 'title description category author')
      .populate('reportedMessage', 'messageBody sender receiver')
      .populate('reviewedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can view this report
    const canView = req.user.role === 'admin' ||
                   req.user.role === 'moderator' ||
                   report.reporter._id.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update report status (admin/moderator only)
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolution } = req.body;
    const moderatorId = req.user._id;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update report based on status
    let updatedReport;
    
    switch (status) {
      case 'under-review':
        updatedReport = await report.assignTo(moderatorId);
        break;
        
      case 'resolved':
        if (!resolution || !resolution.action) {
          return res.status(400).json({
            success: false,
            message: 'Resolution action is required for resolved status'
          });
        }
        updatedReport = await report.resolve(
          resolution.action,
          resolution.notes || '',
          moderatorId
        );
        
        // Apply resolution action
        await applyResolutionAction(report, resolution.action);
        break;
        
      case 'dismissed':
        updatedReport = await report.dismiss(
          resolution?.notes || 'No action needed',
          moderatorId
        );
        break;
        
      case 'escalated':
        updatedReport = await report.escalate(resolution?.notes || 'Escalated for admin review');
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
    }

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Apply resolution action based on report type
const applyResolutionAction = async (report, action) => {
  try {
    switch (action) {
      case 'content-removed':
        if (report.reportType === 'post') {
          await Post.findByIdAndUpdate(report.reportedPost, { 
            status: 'removed',
            'moderation.isReviewed': true,
            'moderation.reviewedAt': new Date()
          });
        } else if (report.reportType === 'message') {
          await Message.findByIdAndUpdate(report.reportedMessage, {
            isDeleted: true,
            deletedAt: new Date()
          });
        }
        break;
        
      case 'user-warned':
        // Could implement a warning system here
        break;
        
      case 'user-suspended':
        if (report.reportedUser) {
          await User.findByIdAndUpdate(report.reportedUser, {
            isActive: false,
            banReason: 'Temporary suspension due to reported behavior',
            bannedAt: new Date()
          });
        }
        break;
        
      case 'user-banned':
        if (report.reportedUser) {
          await User.banUser(
            report.reportedUser,
            'Permanently banned due to reported behavior',
            report.reviewedBy
          );
        }
        break;
        
      case 'content-edited':
        if (report.reportType === 'post') {
          await Post.findByIdAndUpdate(report.reportedPost, {
            'moderation.isReviewed': true,
            'moderation.reviewedAt': new Date(),
            'moderation.reviewedBy': report.reviewedBy
          });
        }
        break;
    }
  } catch (error) {
    console.error('Apply resolution action error:', error);
  }
};

// Get reports summary/statistics (admin only)
const getReportsSummary = async (req, res) => {
  try {
    const [summary, stats] = await Promise.all([
      Report.getReportsSummary(),
      Report.getReportStats()
    ]);

    res.json({
      success: true,
      summary: summary[0] || { total: 0, statusCounts: [] },
      stats
    });

  } catch (error) {
    console.error('Get reports summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reports by current user
const getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, totalCount] = await Promise.all([
      Report.find({ reporter: userId })
        .populate('reportedUser', 'name')
        .populate('reportedPost', 'title category')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments({ reporter: userId })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getPendingReports,
  getReportById,
  updateReportStatus,
  getReportsSummary,
  getMyReports
};
