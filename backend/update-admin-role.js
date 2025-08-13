const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateAdminRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@uniconnect.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('📧 Found user:', adminUser.email);
    console.log('🔰 Current role:', adminUser.role);

    // Update role to admin
    adminUser.role = 'admin';
    await adminUser.save();

    console.log('✅ Admin role updated successfully!');
    console.log('🔰 New role:', adminUser.role);
    console.log('👤 User ID:', adminUser._id);
    
    // Verify the update
    const updatedUser = await User.findById(adminUser._id);
    console.log('🔍 Verification - Role:', updatedUser.role);

  } catch (error) {
    console.error('❌ Error updating admin role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

updateAdminRole();
