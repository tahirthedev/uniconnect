const mongoose = require('mongoose');
require('./config/database');
const User = require('./models/User');

async function clearUsers() {
  try {
    // Wait for database connection
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });

    console.log('Connected to database');
    
    // Show current users
    const users = await User.find({});
    console.log('Current users:', users.map(u => ({ 
      email: u.email, 
      name: u.name,
      _id: u._id 
    })));
    
    // Delete all users
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
    
    console.log('Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing users:', error);
    process.exit(1);
  }
}

clearUsers();
