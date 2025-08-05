require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`Connection state: ${conn.connection.readyState}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check users collection
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}, { email: 1, name: 1, createdAt: 1 });
      console.log('Users:', users);
    }
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
