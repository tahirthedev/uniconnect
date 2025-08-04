const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Google OAuth Strategy - only if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // User exists, update last active and return
      await user.updateLastActive();
      return done(null, user);
    }

    // Check if user exists with same email
    const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
    
    if (existingEmailUser) {
      // Link Google account to existing user
      existingEmailUser.googleId = profile.id;
      if (!existingEmailUser.avatar && profile.photos && profile.photos.length > 0) {
        existingEmailUser.avatar = profile.photos[0].value;
      }
      await existingEmailUser.save();
      await existingEmailUser.updateLastActive();
      return done(null, existingEmailUser);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
      verifiedAt: new Date(), // Google accounts are considered verified
      role: 'user'
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));
} else {
  console.log('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not found');
}

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    
    if (user) {
      // Check if user is active and not banned
      if (!user.isActive || user.isBanned) {
        return done(null, false);
      }
      
      // Update last active
      await user.updateLastActive();
      return done(null, user);
    }
    
    return done(null, false);
  } catch (error) {
    console.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, null);
  }
});

module.exports = passport;
