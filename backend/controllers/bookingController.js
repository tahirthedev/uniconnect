const Booking = require('../models/Booking');
const Post = require('../models/Post');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Book a ride
const bookRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { seats, contactMethod, notes, passengerContact } = req.body;
    const passengerId = req.user.id;

    // Get the ride post
    const ride = await Post.findById(postId).populate('author');
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if the ride is active and available
    if (ride.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This ride is no longer available'
      });
    }

    // Check if user is trying to book their own ride
    if (ride.author._id.toString() === passengerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own ride'
      });
    }

    // Check if user has already booked this ride
    const existingBooking = await Booking.hasUserBooked(postId, passengerId);
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this ride'
      });
    }

    // Check available seats
    const availableSeats = ride.details?.ride?.seats || 0;
    const currentBookings = await Booking.aggregate([
      {
        $match: {
          ride: ride._id,
          status: { $in: ['pending', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalBooked: { $sum: '$seatsBooked' }
        }
      }
    ]);

    const bookedSeats = currentBookings.length > 0 ? currentBookings[0].totalBooked : 0;
    const remainingSeats = availableSeats - bookedSeats;

    if (seats > remainingSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingSeats} seat(s) available`
      });
    }

    // Calculate total price
    const pricePerSeat = typeof ride.price === 'object' ? ride.price.amount : ride.price;
    const totalPrice = pricePerSeat * seats;

    // Create booking
    const booking = new Booking({
      ride: postId,
      passenger: passengerId,
      driver: ride.author._id,
      seatsBooked: seats,
      totalPrice,
      contactMethod: contactMethod || 'message',
      notes,
      passengerContact
    });

    await booking.save();

    // Populate the booking for response
    await booking.populate([
      { path: 'ride', select: 'title details.ride' },
      { path: 'passenger', select: 'name email avatar' },
      { path: 'driver', select: 'name email avatar' }
    ]);

    // Update the post's available seats (if tracking in post)
    // Note: We calculate dynamically, but could cache for performance
    
    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      booking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book ride',
      error: error.message
    });
  }
};

// Get user's bookings (as passenger)
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { passenger: userId };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate([
        { 
          path: 'ride', 
          select: 'title description details.ride location price',
          populate: { path: 'author', select: 'name avatar' }
        },
        { path: 'driver', select: 'name avatar' }
      ])
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

// Get ride bookings (for driver)
const getRideBookings = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Verify the user owns this ride
    const ride = await Post.findById(postId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const bookings = await Booking.find({ ride: postId })
      .populate([
        { path: 'passenger', select: 'name avatar email phone' },
        { path: 'ride', select: 'title details.ride' }
      ])
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get ride bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride bookings',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.passenger.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Calculate refund
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Update booking status (for driver)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the driver
    if (booking.driver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

module.exports = {
  bookRide,
  getUserBookings,
  getRideBookings,
  cancelBooking,
  updateBookingStatus
};
