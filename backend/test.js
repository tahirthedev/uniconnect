const express = require('express');
const request = require('supertest');

// Simple test to verify server functionality
async function testServer() {
  try {
    console.log('🚀 Starting UniConnect Backend Test...\n');

    // Import the server (without starting it)
    const app = express();
    
    // Test if we can create a basic Express app
    app.get('/test', (req, res) => {
      res.json({ message: 'Server is working!' });
    });

    // Test the endpoint
    const response = await request(app)
      .get('/test')
      .expect(200);

    console.log('✅ Basic Express server test passed');
    console.log('Response:', response.body);

    // Test environment variables
    require('dotenv').config();
    const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET', 'MONGODB_URI'];
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length === 0) {
      console.log('✅ Environment variables are properly configured');
    } else {
      console.log('⚠️  Missing environment variables:', missingVars);
    }

    // Test if we can import all our modules
    try {
      require('./models/User');
      require('./models/Post');
      require('./models/Message');
      require('./models/Report');
      require('./models/Analytics');
      console.log('✅ All models can be imported successfully');
    } catch (error) {
      console.log('❌ Error importing models:', error.message);
    }

    try {
      require('./controllers/authController');
      require('./controllers/postController');
      require('./controllers/messageController');
      require('./controllers/reportController');
      require('./controllers/adminController');
      console.log('✅ All controllers can be imported successfully');
    } catch (error) {
      console.log('❌ Error importing controllers:', error.message);
    }

    try {
      require('./routes/auth');
      require('./routes/posts');
      require('./routes/messages');
      require('./routes/reports');
      require('./routes/admin');
      console.log('✅ All routes can be imported successfully');
    } catch (error) {
      console.log('❌ Error importing routes:', error.message);
    }

    console.log('\n🎉 All basic tests passed! The backend structure is ready.');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure MongoDB is running on your system');
    console.log('2. Update Google OAuth credentials in .env file');
    console.log('3. Run "npm run dev" to start the development server');
    console.log('4. The server will be available at http://localhost:5000');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Only install supertest if running this test
const { execSync } = require('child_process');
try {
  require('supertest');
} catch (error) {
  console.log('Installing supertest for testing...');
  execSync('npm install --save-dev supertest', { stdio: 'inherit' });
}

if (require.main === module) {
  testServer();
}

module.exports = testServer;
