const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticate, adminOnly } = require('../middleware/auth');

// Temporary migration endpoint - REMOVE AFTER USE
router.post('/migrate-conversation-ids', adminOnly, async (req, res) => {
  try {
    console.log('Starting conversation ID migration...');
    
    // Find all messages with underscore format
    const messagesWithUnderscore = await Message.find({
      conversationId: { $regex: /_/ }
    });
    
    console.log(`Found ${messagesWithUnderscore.length} messages with underscore format`);
    
    // Update each message
    const updates = [];
    for (const message of messagesWithUnderscore) {
      const newConversationId = message.conversationId.replace('_', '-');
      
      await Message.updateOne(
        { _id: message._id },
        { conversationId: newConversationId }
      );
      
      updates.push({
        old: message.conversationId,
        new: newConversationId
      });
    }
    
    // Verify the migration
    const allConversationIds = await Message.distinct('conversationId');
    
    res.json({
      success: true,
      message: 'Migration completed successfully',
      updatedCount: messagesWithUnderscore.length,
      updates: updates,
      allConversationIds: allConversationIds
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

module.exports = router;
