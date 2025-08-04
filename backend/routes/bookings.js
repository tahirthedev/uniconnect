const express = require('express');
const router = express.Router();

const {
  bookRide,
  getUserBookings,
  getRideBookings,
  cancelBooking,
  updateBookingStatus
} = require('../controllers/bookingController');

const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// All booking routes require authentication
router.use(authenticate);

// Book a ride
router.post('/rides/:postId/book', [
  param('postId').isMongoId().withMessage('Invalid ride ID'),
  body('seats')
    .isInt({ min: 1, max: 8 })
    .withMessage('Seats must be between 1 and 8'),
  body('contactMethod')
    .optional()
    .isIn(['message', 'phone', 'email'])
    .withMessage('Invalid contact method'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  body('passengerContact.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('passengerContact.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  handleValidationErrors
], bookRide);

// Get user's bookings
router.get('/', [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
], getUserBookings);

// Get bookings for a specific ride (driver only)
router.get('/rides/:postId', [
  param('postId').isMongoId().withMessage('Invalid ride ID'),
  handleValidationErrors
], getRideBookings);

// Cancel a booking
router.put('/:bookingId/cancel', [
  param('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('reason')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Cancellation reason must be between 5 and 200 characters'),
  handleValidationErrors
], cancelBooking);

// Update booking status (driver only)
router.put('/:bookingId/status', [
  param('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  handleValidationErrors
], updateBookingStatus);

module.exports = router;
