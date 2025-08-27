const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database using the same URI as your app
const connectDB = async () => {
  try {
    // Use the full MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const Message = require('./models/Message');

async function migrateConversationIds() {
  try {
    // Connect to database first
    await connectDB();
    
    console.log('Starting conversation ID migration...');
    
    // Find all messages with underscore format
    const messagesWithUnderscore = await Message.find({
      conversationId: { $regex: /_/ }
    });
    
    console.log(`Found ${messagesWithUnderscore.length} messages with underscore format`);
    
    // Update each message
    for (const message of messagesWithUnderscore) {
      const newConversationId = message.conversationId.replace('_', '-');
      
      await Message.updateOne(
        { _id: message._id },
        { conversationId: newConversationId }
      );
      
      console.log(`Updated: ${message.conversationId} → ${newConversationId}`);
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the migration
    const allConversationIds = await Message.distinct('conversationId');
    console.log('All conversation IDs after migration:', allConversationIds);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateConversationIds();
