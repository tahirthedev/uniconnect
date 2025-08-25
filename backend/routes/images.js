const express = require('express');
const router = express.Router();
const r2Storage = require('../utils/storage-r2');

// Proxy images from R2 bucket
router.get('/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    
    // Generate a short-lived presigned URL (1 hour)
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(r2Storage.client, command, { expiresIn: 3600 });
    
    // Redirect to the presigned URL
    res.redirect(presignedUrl);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(404).json({ error: 'Image not found' });
  }
});

module.exports = router;
