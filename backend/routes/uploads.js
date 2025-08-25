const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const r2Storage = require('../utils/storage-r2');

// Generate presigned URLs for file uploads
router.post('/presign', authenticate, async (req, res) => {
  try {
    console.log('=== PRESIGN REQUEST ===');
    console.log('User:', req.user ? req.user._id : 'No user');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.log('ERROR: Invalid files array');
      return res.status(400).json({ error: 'Files array is required' });
    }

    // Validate file limits
    if (files.length > 6) {
      console.log('ERROR: Too many files:', files.length);
      return res.status(400).json({ error: 'Maximum 6 files allowed per post' });
    }

    const uploads = [];

    for (const file of files) {
      const { filename, contentType, size } = file;

      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        console.log('ERROR: Invalid content type:', contentType);
        return res.status(400).json({ 
          error: `Invalid file type: ${contentType}. Allowed: ${allowedTypes.join(', ')}` 
        });
      }

      // Validate file size (5MB limit)
      if (size > 5 * 1024 * 1024) {
        console.log('ERROR: File too large:', filename, size);
        return res.status(400).json({ 
          error: `File ${filename} is too large. Maximum size: 5MB` 
        });
      }

      // Generate temporary key and presigned URL
      const key = r2Storage.generateTempImageKey(filename);
      console.log('Generated key:', key);
      
      const presignedUrl = await r2Storage.generatePresignedPutUrl(key, contentType);
      console.log('Generated presigned URL for:', filename);

      uploads.push({
        key,
        presignedUrl,
        filename,
        contentType,
        size,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });
    }

    console.log('SUCCESS: Generated', uploads.length, 'presigned URLs');
    res.json({ uploads });
  } catch (error) {
    console.error('PRESIGN ERROR:', error);
    res.status(500).json({ error: 'Failed to generate upload URLs', details: error.message });
  }
});

// Confirm uploads and move from temp to permanent storage
router.post('/complete', authenticate, async (req, res) => {
  try {
    const { uploads, postId } = req.body;

    if (!uploads || !Array.isArray(uploads)) {
      return res.status(400).json({ error: 'Uploads array is required' });
    }

    const confirmedImages = [];

    for (const upload of uploads) {
      const { key, filename, contentType, size } = upload;

      // Verify the object was uploaded to R2
      const verification = await r2Storage.verifyObject(key);
      if (!verification.exists) {
        return res.status(400).json({ 
          error: `Upload failed: ${filename} was not found in storage` 
        });
      }

      // Generate simple public URL
      let finalKey = key;
      let publicUrl = r2Storage.generatePublicUrl(key);

      if (postId) {
        finalKey = r2Storage.generateImageKey(postId, filename);
        publicUrl = r2Storage.generatePublicUrl(finalKey);
      }

      confirmedImages.push({
        key: finalKey,
        url: publicUrl,
        filename,
        contentType,
        size: verification.size || size,
        width: null, // Could be populated with image processing
        height: null, // Could be populated with image processing
      });
    }

    res.json({ images: confirmedImages });
  } catch (error) {
    console.error('Error confirming uploads:', error);
    res.status(500).json({ error: 'Failed to confirm uploads' });
  }
});

// Delete uploaded file
router.delete('/:key(*)', authenticate, async (req, res) => {
  try {
    const key = req.params.key;
    const success = await r2Storage.deleteObject(key);
    
    if (success) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
