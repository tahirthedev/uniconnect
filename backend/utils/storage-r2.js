const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

class R2Storage {
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = process.env.R2_BUCKET;
  }

  // Generate presigned PUT URL for direct upload
  async generatePresignedPutUrl(key, contentType, expiresIn = 600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // Remove CacheControl temporarily to test
    });

    try {
      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  // Verify object exists after upload
  async verifyObject(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.client.send(command);
      return {
        exists: true,
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
      };
    } catch (error) {
      if (error.name === 'NotFound') {
        return { exists: false };
      }
      throw error;
    }
  }

  // Generate simple public URL - use direct R2 URL for production
  generatePublicUrl(key) {
    // Use direct R2 public URL (works in both dev and production)
    const publicUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    return `${publicUrl}/${encodeURIComponent(key)}`;
  }

  // Generate direct R2 URL as fallback
  generateDirectUrl(key) {
    const bucketName = process.env.R2_BUCKET;
    const accountId = process.env.R2_ACCOUNT_ID;
    
    if (process.env.R2_CUSTOM_DOMAIN) {
      return `https://${process.env.R2_CUSTOM_DOMAIN}/${key}`;
    }
    
    // Use public R2 URL format
    return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
  }

  // Get public URL after upload confirmation
  getPublicUrl(key) {
    return this.generatePublicUrl(key);
  }
  
  async deleteObject(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting object:', error);
      return false;
    }
  }

  // Generate structured key for images
  generateImageKey(postId, filename) {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID().substring(0, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `posts/${postId}/${timestamp}-${uuid}-${sanitizedFilename}`;
  }

  // Generate temporary key for unconfirmed uploads
  generateTempImageKey(filename) {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID().substring(0, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `temp/${timestamp}-${uuid}-${sanitizedFilename}`;
  }
}

module.exports = new R2Storage();
