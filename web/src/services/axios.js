import axios from 'axios';

// Create axios instance with Vite env base URL
// Default to localhost:5166 if env variable is not set
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166/api';

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
    // place for refresh token logic if needed
    if (status === 401) {
      // optionally redirect to login or attempt refresh
      // window.location.href = '/login';
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
export const removeAuthToken = () => setAuthToken(null);
