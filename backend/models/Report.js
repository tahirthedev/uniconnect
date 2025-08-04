const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['post', 'user', 'message'],
    required: true
  },
  // Reference to the reported content
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: function() { return this.reportType === 'post'; }
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.reportType === 'user'; }
  },
  reportedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: function() { return this.reportType === 'message'; }
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'spam',
      'inappropriate-content',
      'harassment',
      'fraud',
      'fake-listing',
      'misleading-information',
      'copyright-violation',
      'hate-speech',
      'violence',
      'adult-content',
      'privacy-violation',
      'other'
    ]
  },
  description: {
    type: String,
    required: true,
    maxLength: 500,
    trim: true
  },
  evidence: [{
    type: { type: String, enum: ['image', 'screenshot', 'url', 'text'] },
    content: { type: String, required: true },
    description: { type: String }
  }],
  status: {
    type: String,
    enum: ['pending', 'under-review', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Moderation actions
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  resolution: {
    action: {
      type: String,
      enum: ['no-action', 'content-removed', 'user-warned', 'user-suspended', 'user-banned', 'content-edited'],
      default: null
    },
    notes: {
      type: String,
      maxLength: 1000
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  // Auto-classification
  autoClassified: {
    type: Boolean,
    default: false
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  },
  // Related reports (for patterns)
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ status: 1, priority: 1 });
reportSchema.index({ reportType: 1, status: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedPost: 1 });
reportSchema.index({ reviewedBy: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reason: 1, status: 1 });

// Compound index for efficient moderation queries
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });

// Method to assign to moderator
reportSchema.methods.assignTo = function(moderatorId) {
  this.reviewedBy = moderatorId;
  this.status = 'under-review';
  this.reviewedAt = new Date();
  return this.save();
};

// Method to resolve report
reportSchema.methods.resolve = function(action, notes, resolvedBy) {
  this.status = 'resolved';
  this.resolution.action = action;
  this.resolution.notes = notes;
  this.resolution.resolvedAt = new Date();
  this.reviewedBy = resolvedBy;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to dismiss report
reportSchema.methods.dismiss = function(notes, dismissedBy) {
  this.status = 'dismissed';
  this.resolution.action = 'no-action';
  this.resolution.notes = notes;
  this.resolution.resolvedAt = new Date();
  this.reviewedBy = dismissedBy;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to escalate report
reportSchema.methods.escalate = function(notes) {
  this.status = 'escalated';
  this.priority = 'critical';
  this.resolution.notes = notes;
  return this.save();
};

// Static method to get pending reports
reportSchema.statics.getPendingReports = function() {
  return this.find({ status: 'pending' })
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedPost', 'title category')
    .populate('reviewedBy', 'name')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to get reports by moderator
reportSchema.statics.getReportsByModerator = function(moderatorId) {
  return this.find({ reviewedBy: moderatorId })
    .populate('reporter', 'name')
    .populate('reportedUser', 'name')
    .populate('reportedPost', 'title')
    .sort({ createdAt: -1 });
};

// Static method to get reports summary
reportSchema.statics.getReportsSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Static method to find similar reports
reportSchema.statics.findSimilarReports = function(reportData) {
  const query = {
    reason: reportData.reason,
    status: { $in: ['pending', 'under-review'] }
  };

  if (reportData.reportedUser) {
    query.reportedUser = reportData.reportedUser;
  }

  if (reportData.reportedPost) {
    query.reportedPost = reportData.reportedPost;
  }

  return this.find(query).limit(10);
};

// Static method to get report statistics
reportSchema.statics.getReportStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          reason: '$reason',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.reason',
        totalCount: { $sum: '$count' },
        statusBreakdown: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        }
      }
    },
    {
      $sort: { totalCount: -1 }
    }
  ]);
};

// Pre-save middleware to auto-classify priority
reportSchema.pre('save', function(next) {
  if (this.isNew) {
    // Auto-classify priority based on reason
    const highPriorityReasons = ['harassment', 'fraud', 'hate-speech', 'violence'];
    const criticalReasons = ['adult-content', 'copyright-violation'];
    
    if (criticalReasons.includes(this.reason)) {
      this.priority = 'critical';
    } else if (highPriorityReasons.includes(this.reason)) {
      this.priority = 'high';
    }
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
