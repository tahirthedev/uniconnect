/**
 * Utility functions for post navigation and interactions
 */

import { apiClient } from './api';

export const getPostUrl = (post: { _id: string; category: string }): string => {
  switch (post.category) {
    case 'jobs':
      return `/jobs/${post._id}`;
    case 'accommodation':
      return `/accommodation/${post._id}`;
    case 'buy-sell':
    case 'marketplace':
      return `/marketplace/${post._id}`;
    case 'currency-exchange':
      return `/currency/${post._id}`;
    case 'pick-drop':
    case 'ridesharing':
      // Ridesharing doesn't have individual pages, will handle contact modal
      return '#';
    default:
      return `/posts/${post._id}`;
  }
};

export const isClickablePost = (category: string): boolean => {
  return ['jobs', 'accommodation', 'buy-sell', 'marketplace', 'currency-exchange'].includes(category);
};

export const shouldShowContactButton = (category: string): boolean => {
  return ['pick-drop', 'ridesharing'].includes(category);
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'pick-drop':
    case 'ridesharing':
      return 'Car';
    case 'accommodation':
      return 'Home';
    case 'jobs':
      return 'Briefcase';
    case 'buy-sell':
    case 'marketplace':
      return 'ShoppingBag';
    case 'currency-exchange':
      return 'DollarSign';
    default:
      return 'MessageCircle';
  }
};

// Image upload utilities
export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadedImage {
  key: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
}

export const uploadImages = async (
  files: File[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadedImage[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  // Validate files
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
    }
    if (file.size > maxSize) {
      throw new Error(`File ${file.name} is too large. Maximum size: 5MB`);
    }
  }

  if (files.length > 6) {
    throw new Error('Maximum 6 images allowed per post');
  }

  // Initialize progress tracking
  const progressArray: UploadProgress[] = files.map(file => ({
    filename: file.name,
    progress: 0,
    status: 'pending'
  }));

  if (onProgress) {
    onProgress([...progressArray]);
  }

  try {
    // Step 1: Request presigned URLs
    const fileMetadata = files.map(file => ({
      filename: file.name,
      contentType: file.type,
      size: file.size
    }));

    const presignResponse = await apiClient.requestPresignedUrls(fileMetadata);
    const { uploads } = presignResponse;

    // Step 2: Upload files to R2
    const uploadPromises = uploads.map(async (upload: any, index: number) => {
      const file = files[index];
      
      progressArray[index].status = 'uploading';
      if (onProgress) {
        onProgress([...progressArray]);
      }

      try {
        await apiClient.uploadFileToR2(
          upload.presignedUrl,
          file,
          (progress) => {
            progressArray[index].progress = progress;
            if (onProgress) {
              onProgress([...progressArray]);
            }
          }
        );

        progressArray[index].status = 'completed';
        progressArray[index].progress = 100;
        if (onProgress) {
          onProgress([...progressArray]);
        }

        return upload;
      } catch (error) {
        progressArray[index].status = 'error';
        progressArray[index].error = error instanceof Error ? error.message : 'Upload failed';
        if (onProgress) {
          onProgress([...progressArray]);
        }
        throw error;
      }
    });

    await Promise.all(uploadPromises);

    // Step 3: Confirm uploads
    const confirmResponse = await apiClient.confirmUploads(uploads);
    return confirmResponse.images;

  } catch (error) {
    // Mark any pending uploads as error
    progressArray.forEach(p => {
      if (p.status === 'pending' || p.status === 'uploading') {
        p.status = 'error';
        p.error = error instanceof Error ? error.message : 'Upload failed';
      }
    });
    
    if (onProgress) {
      onProgress([...progressArray]);
    }
    
    throw error;
  }
};

export const deleteImage = async (key: string): Promise<void> => {
  await apiClient.deleteUpload(key);
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'pick-drop':
    case 'ridesharing':
      return 'bg-blue-500';
    case 'accommodation':
      return 'bg-green-500';
    case 'jobs':
      return 'bg-purple-500';
    case 'buy-sell':
    case 'marketplace':
      return 'bg-pink-500';
    case 'currency-exchange':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};
