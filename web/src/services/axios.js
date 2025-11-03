import axios from 'axios';

// Create axios instance with Vite env base URL
// Default to localhost:5166 if env variable is not set
// Note: baseURL should NOT include /api because routes already have /api prefix
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';

// Log warning if using default URL (helpful for debugging)
if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL not set, using default:', API_BASE);
  console.warn('Please create a .env file in the web/ directory with: VITE_API_BASE_URL=http://localhost:5166/api');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization header if token is present
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    
    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      const originalRequest = error.config;
      
      // Try to refresh token if we have a refresh token and haven't already tried
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Import accountService dynamically to avoid circular dependency
          const accountService = (await import('./accountService')).default;
          const refreshResult = await accountService.refreshToken(refreshToken);
          
          if (refreshResult.success && refreshResult.data?.AccessToken) {
            // Retry the original request with new token
            const newToken = refreshResult.data.AccessToken;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // If refresh fails, clear tokens and redirect to login
          removeAuthToken();
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');
          sessionStorage.removeItem('user_role');
          
          // Only redirect if we're not already on login/register page
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token or already retried - clear tokens and redirect
        removeAuthToken();
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        sessionStorage.removeItem('user_role');
        
        // Only redirect if we're not already on login/register page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper to set token programmatically
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.Authorization;
  }
};

// Helper to remove token
export const removeAuthToken = () => {
  setAuthToken(null);
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  sessionStorage.removeItem('user_role');
};
