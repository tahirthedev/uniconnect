require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function checkSpecificUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const User = require('./models/User');
    
    // Check for the specific email that's causing issues
    const specificUser = await User.findOne({ email: 'sai@xpertwebstudio.co.uk' });
    console.log('User with email sai@xpertwebstudio.co.uk:', specificUser);
    
    // Also check for any similar emails (case sensitivity, etc.)
    const similarUsers = await User.find({ 
      email: { $regex: 'sai.*xpertwebstudio', $options: 'i' } 
    });
    console.log('Similar emails found:', similarUsers);
    
    // List all users to see what's actually in the database
    const allUsers = await User.find({}, { email: 1, name: 1, phone: 1, createdAt: 1 });
    console.log('All users in database:', allUsers);
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSpecificUser();
