const express = require('express');
const router = express.Router();

const {
  createReport,
  getAllReports,
  getPendingReports,
  getReportById,
  updateReportStatus,
  getReportsSummary,
  getMyReports
} = require('../controllers/reportController');

const { authenticate, moderatorOrAdmin } = require('../middleware/auth');
const { reportValidations, commonValidations } = require('../utils/validation');

// User routes (require authentication)
router.use(authenticate);

// Create new report
router.post('/', reportValidations.create, createReport);

// Get current user's reports
router.get('/my-reports', [
  ...commonValidations.pagination
], getMyReports);

// Moderator/Admin routes
router.get('/', moderatorOrAdmin, [
  require('express-validator').query('status')
    .optional()
    .isIn(['pending', 'under-review', 'resolved', 'dismissed', 'escalated'])
    .withMessage('Invalid status filter'),
  require('express-validator').query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority filter'),
  require('express-validator').query('reportType')
    .optional()
    .isIn(['post', 'user', 'message'])
    .withMessage('Invalid report type filter'),
  require('express-validator').query('reason')
    .optional()
    .isIn([
      'spam', 'inappropriate-content', 'harassment', 'fraud', 'fake-listing',
      'misleading-information', 'copyright-violation', 'hate-speech', 'violence',
      'adult-content', 'privacy-violation', 'other'
    ])
    .withMessage('Invalid reason filter'),
  ...commonValidations.pagination,
  require('../utils/validation').handleValidationErrors
], getAllReports);

// Get pending reports
router.get('/pending', moderatorOrAdmin, getPendingReports);

// Get reports summary/statistics
router.get('/summary', moderatorOrAdmin, getReportsSummary);

// Get specific report details
router.get('/:reportId', [
  commonValidations.objectId('reportId')
], getReportById);

// Update report status
router.put('/:reportId/status', moderatorOrAdmin, reportValidations.updateStatus, updateReportStatus);

module.exports = router;
