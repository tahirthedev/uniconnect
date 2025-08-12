const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@uniconnect.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🟢 Active:', adminUser.isActive);
    console.log('🚫 Banned:', adminUser.isBanned);
    console.log('🔐 Has Password:', !!adminUser.password);
    
    // Test password
    if (adminUser.password) {
      const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log('🔓 Password Valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('🔄 Password seems incorrect, updating it...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        await User.findByIdAndUpdate(adminUser._id, { 
          password: hashedPassword,
          isActive: true,
          isBanned: false 
        });
        
        console.log('✅ Password updated successfully!');
      }
    } else {
      console.log('❌ No password set for admin user!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

checkAdminUser();
