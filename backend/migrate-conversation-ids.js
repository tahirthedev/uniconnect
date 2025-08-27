const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect');

const Message = require('./models/Message');

async function migrateConversationIds() {
  try {
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
