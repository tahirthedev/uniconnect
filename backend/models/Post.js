const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['ridesharing', 'pick-drop', 'jobs', 'buy-sell', 'accommodation', 'currency-exchange']
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    key: { type: String }, // R2 object key - make optional for backward compatibility
    url: { type: String, required: true }, // Public URL
    filename: { type: String }, // Original filename - make optional
    contentType: { type: String }, // MIME type - make optional
    size: { type: Number }, // File size in bytes - make optional
    width: { type: Number }, // Image width in pixels
    height: { type: Number }, // Image height in pixels
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  price: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    type: { 
      type: String, 
      enum: ['fixed', 'hourly', 'negotiable', 'yearly', 'monthly'],
      default: 'fixed'
    }
  },
  location: {
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'US', trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    address: { type: String, trim: true },
    // GeoJSON point for geospatial queries
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    preferredMethod: {
      type: String,
      enum: ['message', 'email', 'phone'],
      default: 'message'
    },
    phone: { type: String, trim: true },
    email: { type: String, trim: true }
  },
  // Category-specific fields
  details: {
    // For ridesharing
    ride: {
      from: { type: String, trim: true },
      to: { type: String, trim: true },
      date: { type: Date },
      time: { type: String },
      seats: { type: Number, min: 1, max: 8 },
      recurring: { type: Boolean, default: false },
      vehicle: { type: String, trim: true }
    },
    // For jobs
    job: {
      type: { 
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
      },
      company: { type: String, trim: true },
      salary: {
        min: { type: Number },
        max: { type: Number },
        period: { type: String, enum: ['hour', 'day', 'month', 'year'] }
      },
      requirements: [{ type: String, trim: true }],
      benefits: [{ type: String, trim: true }],
      remote: { type: Boolean, default: false }
    },
    // For accommodation
    accommodation: {
      type: { 
        type: String,
        enum: ['private-room', 'shared-room', 'entire-place', 'roommate-wanted']
      },
      bedrooms: { type: Number, min: 0 },
      bathrooms: { type: Number, min: 0 },
      furnishing: { 
        type: String,
        enum: ['furnished', 'semi-furnished', 'unfurnished']
      },
      amenities: [{ type: String, trim: true }],
      moveInDate: { type: Date },
      leaseTerm: { type: String, trim: true },
      petsAllowed: { type: Boolean, default: false }
    },
    // For buy-sell
    item: {
      condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'poor']
      },
      brand: { type: String, trim: true },
      model: { type: String, trim: true },
      specifications: [{ type: String, trim: true }],
      warranty: { type: String, trim: true }
    },
    // For currency exchange
    currency: {
      from: { type: String, trim: true },
      to: { type: String, trim: true },
      rate: { type: Number },
      amount: { type: Number }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'completed', 'flagged', 'removed'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'featured'],
    default: 'normal'
  },
  moderation: {
    isReviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    flaggedAt: { type: Date },
    autoFlagged: { type: Boolean, default: false },
    flaggedKeywords: [{ type: String }]
  },
  // Engagement metrics
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ category: 1, status: 1 });
postSchema.index({ 'location.city': 1, category: 1 });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ expiresAt: 1 });
postSchema.index({ 'moderation.isFlagged': 1 });
postSchema.index({ priority: 1, createdAt: -1 });

// Text index for search functionality
postSchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'details.job.company': 'text'
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for report count
postSchema.virtual('reportCount').get(function() {
  return this.reports ? this.reports.length : 0;
});

// Method to increment views
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const userIndex = this.likes.indexOf(userId);
  if (userIndex > -1) {
    this.likes.splice(userIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Method to flag post
postSchema.methods.flagPost = function(reason, keywords = [], auto = false) {
  this.moderation.isFlagged = true;
  this.moderation.flagReason = reason;
  this.moderation.flaggedAt = new Date();
  this.moderation.autoFlagged = auto;
  if (keywords.length > 0) {
    this.moderation.flaggedKeywords = keywords;
  }
  return this.save();
};

// Static method to find active posts
postSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find by category
postSchema.statics.findByCategory = function(category) {
  return this.findActive().where('category').equals(category);
};

// Static method to search posts
postSchema.statics.searchPosts = function(query, filters = {}) {
  let searchQuery = this.findActive();
  
  if (query) {
    searchQuery = searchQuery.find({ $text: { $search: query } });
  }
  
  if (filters.category) {
    searchQuery = searchQuery.where('category').equals(filters.category);
  }
  
  if (filters.city) {
    searchQuery = searchQuery.where('location.city').regex(new RegExp(filters.city, 'i'));
  }
  
  if (filters.priceMin || filters.priceMax) {
    const priceQuery = {};
    if (filters.priceMin) priceQuery.$gte = filters.priceMin;
    if (filters.priceMax) priceQuery.$lte = filters.priceMax;
    searchQuery = searchQuery.where('price.amount').gte(priceQuery.$gte || 0).lte(priceQuery.$lte || Number.MAX_VALUE);
  }
  
  return searchQuery.sort({ priority: -1, createdAt: -1 });
};

// Find posts within a certain distance
postSchema.statics.findNearby = function(longitude, latitude, maxDistance = 20000) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        distanceField: "distance",
        maxDistance: maxDistance, // in meters (20km = 20000m)
        spherical: true,
        query: { status: 'active' },
        key: "location.geoLocation" // Explicitly specify the index to use
      }
    },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorInfo'
      }
    },
    {
      $addFields: {
        authorInfo: {
          $cond: {
            if: { $gt: [{ $size: "$authorInfo" }, 0] },
            then: { $arrayElemAt: ["$authorInfo", 0] },
            else: { name: "Anonymous", email: "", avatar: "" }
          }
        }
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        category: 1,
        subcategory: 1,
        price: 1,
        location: 1,
        images: 1,
        createdAt: 1,
        distance: 1,
        distanceKm: 1,
        'authorInfo.name': 1,
        'authorInfo.email': 1,
        'authorInfo.avatar': 1
      }
    },
    {
      $sort: { distance: 1, createdAt: -1 }
    }
  ]);
};

// Pre-save middleware to auto-moderate and set geolocation
postSchema.pre('save', function(next) {
  // Only set geoLocation if we have valid coordinates
  if (this.location && this.location.coordinates && 
      this.location.coordinates.latitude && this.location.coordinates.longitude &&
      !isNaN(this.location.coordinates.latitude) && !isNaN(this.location.coordinates.longitude)) {
    
    this.location.geoLocation = {
      type: 'Point',
      coordinates: [
        parseFloat(this.location.coordinates.longitude),
        parseFloat(this.location.coordinates.latitude)
      ]
    };
  } else {
    // Remove geoLocation if no valid coordinates to prevent index errors
    if (this.location && this.location.geoLocation) {
      this.location.geoLocation = undefined;
    }
  }

  if (this.isNew || this.isModified('title') || this.isModified('description')) {
    // Basic keyword detection for auto-flagging
    const flaggedKeywords = ['spam', 'scam', 'fake', 'fraud', 'inappropriate'];
    const content = (this.title + ' ' + this.description).toLowerCase();
    
    const foundKeywords = flaggedKeywords.filter(keyword => content.includes(keyword));
    
    if (foundKeywords.length > 0) {
      this.moderation.isFlagged = true;
      this.moderation.flagReason = 'Auto-flagged for suspicious content';
      this.moderation.flaggedAt = new Date();
      this.moderation.autoFlagged = true;
      this.moderation.flaggedKeywords = foundKeywords;
      this.status = 'flagged';
    }
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
