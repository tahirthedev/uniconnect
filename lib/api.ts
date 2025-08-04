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
          console.error('API error response:', errorData); // Log for debugging
          
          // Log detailed validation errors if they exist
          if (errorData.errors && Array.isArray(errorData.errors)) {
            console.error('Detailed validation errors:');
            errorData.errors.forEach((error: any, index: number) => {
              console.error(`${index + 1}. Field: ${error.path || error.param || 'unknown'}, Message: ${error.msg || error.message || JSON.stringify(error)}`);
            });
          }
          
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
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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
  async getPosts() {
    return this.request('/api/posts');
  }

  async createPost(postData: any) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
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
    const token = localStorage.getItem('token');
    return this.request(`/api/messages/to/${receiverId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData),
    });
  }

  async getConversation(userId: string) {
    const token = localStorage.getItem('token');
    return this.request(`/api/messages/conversation/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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
}

export const apiClient = new ApiClient();
