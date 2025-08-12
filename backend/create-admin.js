const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createDummyAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@uniconnect.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Hash password
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = new User({
      email: 'admin@uniconnect.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isBanned: false,
      location: {
        city: 'Admin City',
        coordinates: [0, 0]
      },
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      isEmailVerified: true,
      isPhoneVerified: false
    });

    // Save to database
    await adminUser.save();
    
    console.log('✅ Dummy admin user created successfully!');
    console.log('📧 Email: admin@uniconnect.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('');
    console.log('🚀 You can now login with these credentials and access /admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('User with this email already exists. Updating role to admin...');
      try {
        const user = await User.findOneAndUpdate(
          { email: 'admin@uniconnect.com' },
          { role: 'admin', isActive: true, isBanned: false },
          { new: true }
        );
        console.log('✅ Updated existing user to admin role:', user.email);
      } catch (updateError) {
        console.error('❌ Error updating user role:', updateError.message);
      }
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
createDummyAdmin();
