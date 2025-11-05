import api from '../services/axios';

/**
 * Helper function to get current user ID from JWT token
 * @returns {Promise<number>} Current teacher/user ID
 */
export const getCurrentTeacherId = async () => {
  try {
    // Try to get from API
    const response = await api.get('/api/account/profile');
    if (response.data?.data?.id || response.data?.data?.Id) {
      return response.data.data.id || response.data.data.Id;
    }
    // Fallback: decode JWT token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      // Try different claim names that might contain user ID
      const userId = decoded.userId || decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.id;
      return parseInt(userId) || 1;
    }
  } catch (error) {
    console.error('Error getting current teacher ID:', error);
  }
  return 1; // Default fallback
};
