// Authentication utilities

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUserInfo = (): any | null => {
  if (typeof window === 'undefined') return null;
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  window.location.href = '/auth';
};

export const requireAuth = (redirectTo: string = '/auth'): boolean => {
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

// Check if token is expired (basic check)
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // Invalid token format
  }
};

// Auto logout if token expired
export const checkTokenExpiry = (): void => {
  if (isAuthenticated() && isTokenExpired()) {
    logout();
  }
};
