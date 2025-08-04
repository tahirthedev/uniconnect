const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  email: {
    type: String,
    required: function() {
      return !this.phone; // Email required if no phone
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  bannedAt: {
    type: Date,
    default: null
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    }
  },
  // Analytics tracking
  totalPosts: {
    type: Number,
    default: 0
  },
  totalMessages: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isBanned: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password if provided
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.preferences.privacy.showEmail ? this.email : null,
    phone: this.preferences.privacy.showPhone ? this.phone : null,
    avatar: this.avatar,
    role: this.role,
    isActive: this.isActive,
    isBanned: this.isBanned,
    verifiedAt: this.verifiedAt,
    createdAt: this.createdAt,
    totalPosts: this.totalPosts,
    totalMessages: this.totalMessages
  };
});

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true, isBanned: false });
};

// Static method to ban user
userSchema.statics.banUser = function(userId, reason, bannedBy) {
  return this.findByIdAndUpdate(userId, {
    isBanned: true,
    banReason: reason,
    bannedAt: new Date(),
    bannedBy: bannedBy
  }, { new: true });
};

// Static method to unban user
userSchema.statics.unbanUser = function(userId) {
  return this.findByIdAndUpdate(userId, {
    isBanned: false,
    banReason: null,
    bannedAt: null,
    bannedBy: null
  }, { new: true });
};

module.exports = mongoose.model('User', userSchema);
