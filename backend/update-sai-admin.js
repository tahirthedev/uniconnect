const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserToAdmin = async () => {
  try {
    // Use the internal MongoDB URI that Railway provides
    const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    console.log('🔄 Attempting to connect to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find and update the user by email
    const userEmail = 'sai@uniconnect.com';
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { role: 'admin' },
      { new: true, select: '-password' }
    );

    if (user) {
      console.log('✅ User updated successfully:');
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
    } else {
      console.log('❌ User not found with email:', userEmail);
      
      // Try to find all users to debug
      const allUsers = await User.find({}, 'name email role').limit(5);
      console.log('📋 Found users:', allUsers);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

updateUserToAdmin();
