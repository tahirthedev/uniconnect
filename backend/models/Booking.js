const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  contactMethod: {
    type: String,
    enum: ['message', 'phone', 'email'],
    default: 'message'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxLength: 500,
    trim: true
  },
  // Passenger contact details shared with driver
  passengerContact: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true }
  },
  // Driver confirmation
  driverConfirmed: {
    type: Boolean,
    default: true // Auto-confirm for now
  },
  confirmedAt: {
    type: Date,
    default: Date.now
  },
  // Trip completion
  completedAt: {
    type: Date
  },
  // Ratings (after trip completion)
  passengerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxLength: 500, trim: true },
    ratedAt: { type: Date }
  },
  driverRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxLength: 500, trim: true },
    ratedAt: { type: Date }
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ ride: 1, passenger: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ passenger: 1, status: 1 });
bookingSchema.index({ bookingDate: -1 });

// Virtual for trip date (derived from ride details)
bookingSchema.virtual('tripDate').get(function() {
  return this.populated('ride') ? this.ride.details?.ride?.date : null;
});

// Ensure passenger cannot book their own ride
bookingSchema.pre('save', function(next) {
  if (this.passenger.toString() === this.driver.toString()) {
    return next(new Error('Cannot book your own ride'));
  }
  next();
});

// Static method to check if user has already booked a ride
bookingSchema.statics.hasUserBooked = async function(rideId, userId) {
  const booking = await this.findOne({
    ride: rideId,
    passenger: userId,
    status: { $in: ['pending', 'confirmed'] }
  });
  return !!booking;
};

// Method to calculate refund amount based on cancellation time
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const tripDate = this.tripDate;
  
  if (!tripDate) return 0;
  
  const hoursUntilTrip = (tripDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilTrip > 24) return this.totalPrice; // Full refund
  if (hoursUntilTrip > 12) return this.totalPrice * 0.75; // 75% refund
  if (hoursUntilTrip > 6) return this.totalPrice * 0.50; // 50% refund
  return 0; // No refund
};

module.exports = mongoose.model('Booking', bookingSchema);
