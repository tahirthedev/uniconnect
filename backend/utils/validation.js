const { body, param, query, validationResult } = require('express-validator');

// Custom validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  phone: body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  objectId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
    
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// User validation rules
const userValidations = {
  register: [
    commonValidations.name,
    body('email')
      .if(body('phone').not().exists())
      .isEmail()
      .normalizeEmail()
      .withMessage('Email is required if phone is not provided'),
    body('phone')
      .if(body('email').not().exists())
      .isMobilePhone()
      .withMessage('Phone is required if email is not provided'),
    body().custom((value) => {
      if (!value.email && !value.phone) {
        throw new Error('Either email or phone is required');
      }
      return true;
    }),
    handleValidationErrors
  ],
  
  updateProfile: [
    commonValidations.name.optional(),
    commonValidations.email,
    commonValidations.phone,
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    handleValidationErrors
  ]
};

// Post validation rules
const postValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('category')
      .isIn(['ridesharing', 'pick-drop', 'jobs', 'buy-sell', 'accommodation', 'currency-exchange'])
      .withMessage('Invalid category'),
    body('location.city')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('location.state')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('State must be less than 100 characters'),
    body('location.country')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Country must be less than 100 characters'),
    body('price.amount')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('price.type')
      .optional()
      .isIn(['fixed', 'negotiable', 'free', 'hourly', 'daily', 'monthly'])
      .withMessage('Invalid price type'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('images.*.url')
      .optional()
      .isURL()
      .withMessage('Each image must have a valid URL'),
    handleValidationErrors
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('location.city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('price.amount')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    query('category')
      .optional()
      .isIn(['ridesharing', 'pick-drop', 'jobs', 'buy-sell', 'accommodation', 'currency-exchange'])
      .withMessage('Invalid category'),
    query('city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    query('priceMin')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('priceMax')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    ...commonValidations.pagination,
    handleValidationErrors
  ]
};

// Message validation rules
const messageValidations = {
  send: [
    commonValidations.objectId('receiverId'),
    body('messageBody')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be between 1 and 1000 characters'),
    body('messageType')
      .optional()
      .isIn(['text', 'image', 'file'])
      .withMessage('Invalid message type'),
    body('relatedPost')
      .optional()
      .isMongoId()
      .withMessage('Invalid post reference'),
    handleValidationErrors
  ],
  
  getConversation: [
    commonValidations.objectId('userId'),
    ...commonValidations.pagination,
    handleValidationErrors
  ]
};

// Report validation rules
const reportValidations = {
  create: [
    body('reportType')
      .isIn(['post', 'user', 'message'])
      .withMessage('Invalid report type'),
    body('reportedPost')
      .if(body('reportType').equals('post'))
      .isMongoId()
      .withMessage('Invalid post ID'),
    body('reportedUser')
      .if(body('reportType').equals('user'))
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('reportedMessage')
      .if(body('reportType').equals('message'))
      .isMongoId()
      .withMessage('Invalid message ID'),
    body('reason')
      .isIn([
        'spam', 'inappropriate-content', 'harassment', 'fraud', 'fake-listing',
        'misleading-information', 'copyright-violation', 'hate-speech', 'violence',
        'adult-content', 'privacy-violation', 'other'
      ])
      .withMessage('Invalid reason'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    handleValidationErrors
  ],
  
  updateStatus: [
    commonValidations.objectId('reportId'),
    body('status')
      .isIn(['under-review', 'resolved', 'dismissed', 'escalated'])
      .withMessage('Invalid status'),
    body('resolution.action')
      .optional()
      .isIn(['no-action', 'content-removed', 'user-warned', 'user-suspended', 'user-banned', 'content-edited'])
      .withMessage('Invalid resolution action'),
    body('resolution.notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Resolution notes must be less than 1000 characters'),
    handleValidationErrors
  ]
};

// Admin validation rules
const adminValidations = {
  banUser: [
    commonValidations.objectId('userId'),
    body('reason')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Ban reason must be between 5 and 200 characters'),
    handleValidationErrors
  ],
  
  updateUserRole: [
    commonValidations.objectId('userId'),
    body('role')
      .isIn(['user', 'moderator', 'admin'])
      .withMessage('Invalid role'),
    handleValidationErrors
  ]
};

// Analytics validation rules
const analyticsValidations = {
  getStats: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO date'),
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Invalid period'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  userValidations,
  postValidations,
  messageValidations,
  reportValidations,
  adminValidations,
  analyticsValidations
};
