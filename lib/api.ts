const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          
          let errorMsg = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMsg += '\n' + errorData.errors.map((e: any) => (e.msg || e.message || JSON.stringify(e))).join('\n');
          }
          
          // Create an error object with the response data for better handling
          const apiError = new Error(errorMsg);
          (apiError as any).response = { data: errorData };
          throw apiError;
        } catch (jsonError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }
      
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Return empty object for non-JSON responses
        return {};
      }
    } catch (error) {
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // API info
  async getApiInfo() {
    return this.request('/api');
  }

  // Auth endpoints
  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any) {
    // Transform email to emailOrPhone to match backend expectations
    const loginData = {
      emailOrPhone: credentials.email || credentials.emailOrPhone,
      password: credentials.password
    };
    
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  // Posts endpoints
  async getPosts(params?: {
    category?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
    sort?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    let endpoint = '/api/posts';
    
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }
    
    return this.request(endpoint);
  }

  async createPost(postData: any) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId: string) {
    return this.request(`/api/posts/${postId}`);
  }

  // Messages endpoints
  async getMessages() {
    const token = localStorage.getItem('token');
    return this.request('/api/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async sendMessage(receiverId: string, messageData: any) {
    return this.request(`/api/messages/to/${receiverId}`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversation(userId: string) {
    return this.request(`/api/messages/conversation/${userId}`);
  }

  async getConversations() {
    const response = await this.request('/api/messages');
    // Handle 204 responses or empty responses
    return response || { conversations: [] };
  }

  // Booking endpoints
  async bookRide(rideId: string, bookingData: any) {
    const token = localStorage.getItem('token');
    return this.request(`/api/bookings/rides/${rideId}/book`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings() {
    const token = localStorage.getItem('token');
    return this.request('/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async cancelBooking(bookingId: string, data: any) {
    const token = localStorage.getItem('token');
    return this.request(`/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
  }

  // Dashboard endpoints
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async getMyPosts() {
    return this.request('/api/posts/my-posts');
  }

  async getMyStats() {
    return this.request('/api/posts/my-stats');
  }

  async deletePost(postId: string) {
    return this.request(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async getPostById(postId: string) {
    return this.request(`/api/posts/${postId}`);
  }

  async updatePost(postId: string, postData: any) {
    return this.request(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  // Image upload methods
  async requestPresignedUrls(files: { filename: string; contentType: string; size: number }[]) {
    return this.request('/api/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ files }),
    });
  }

  async confirmUploads(uploads: any[], postId?: string) {
    return this.request('/api/uploads/complete', {
      method: 'POST',
      body: JSON.stringify({ uploads, postId }),
    });
  }

  async deleteUpload(key: string) {
    return this.request(`/api/uploads/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

    // Upload file directly to R2 using presigned URL
  async uploadFileToR2(presignedUrl: string, file: File, onProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          console.error('Upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.response,
            responseText: xhr.responseText
          });
          reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error(`Upload failed: Network error or CORS issue. Status: ${xhr.status}, ReadyState: ${xhr.readyState}`));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
}

export const apiClient = new ApiClient();
