const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();

// Create a one-time admin setup endpoint
app.get('/setup-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Update user role to admin
    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin role assigned successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error setting up admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Admin setup server running on port ${port}`);
      console.log(`Visit: http://localhost:${port}/setup-admin/689c7a2e0ce86f72fbf04f74`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
