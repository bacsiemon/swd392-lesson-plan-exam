import api from './axios';
import { setAuthToken, removeAuthToken } from './axios';

const accountService = {
  /**
   * Login with email and password
   * POST /api/Account/login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, data?: {token: string, user: object}, message?: string}>}
   */
  async login(email, password) {
    try {
      const response = await api.post('/api/Account/login', {
        email,
        password,
      });

      if (response.data) {
        // Backend returns BaseResponse structure: { StatusCode, Message, Data: LoginResponse }
        // LoginResponse contains: { Id, Email, FullName, Role (EUserRole enum: 0/1/2), AccessToken, RefreshToken, ... }
        const baseResponse = response.data;
        const loginData = baseResponse.data || baseResponse.Data || baseResponse; // Try nested data first
        
        console.log('🔍 Login response structure:', {
          baseResponse: baseResponse,
          hasData: !!baseResponse.data,
          loginData: loginData
        });
        
        let roleFromToken = null;
        
        // Save token to localStorage - check both camelCase and PascalCase
        const token = loginData.accessToken || loginData.AccessToken || loginData.token || loginData.Token || baseResponse.accessToken || baseResponse.token;
        if (token) {
          setAuthToken(token);
          
          // Decode token to get role and save it
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            roleFromToken = decoded.role || decoded.Role || 
                        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];
            if (roleFromToken) {
              localStorage.setItem('user_role', roleFromToken);
              sessionStorage.setItem('user_role', roleFromToken); // Also save to sessionStorage for faster access
              console.log('✅ Role saved from token:', roleFromToken);
            }
          } catch (error) {
            console.error('Error decoding token to get role:', error);
          }
        }

        // Get role from response data - check both camelCase and PascalCase
        // Role is EUserRole enum: 0 (Admin), 1 (Teacher), 2 (Student)
        const roleFromResponse = loginData.role || loginData.Role || loginData.roleEnum || loginData.RoleEnum;
        const finalRole = roleFromResponse || roleFromToken;
        
        console.log('🔍 Role detection:', {
          loginData: loginData,
          roleFromResponse,
          roleFromToken,
          finalRole
        });
        
        if (finalRole !== null && finalRole !== undefined) {
          // Convert role to string for consistent storage
          const roleToSave = String(finalRole);
          if (!localStorage.getItem('user_role') || localStorage.getItem('user_role') !== roleToSave) {
            localStorage.setItem('user_role', roleToSave);
            sessionStorage.setItem('user_role', roleToSave); // Also save to sessionStorage
            console.log('✅ Role saved:', roleToSave, '(type:', typeof finalRole, ')');
          }
        }

        return {
          success: true,
          data: loginData, // Return the LoginResponse data directly
          baseResponse: baseResponse, // Also include full response for debugging
          message: baseResponse.message || baseResponse.Message || 'Đăng nhập thành công',
        };
      }

      return {
        success: false,
        message: 'Không nhận được dữ liệu từ server',
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.',
      };
    }
  },

  /**
   * Register a new account
   * POST /api/Account/register
   * @param {object} registerData - Registration data
   * @param {string} registerData.fullName - Full name
   * @param {string} registerData.email - Email
   * @param {string} registerData.phone - Phone number
   * @param {string} registerData.password - Password
   * @param {string} registerData.role - Role (teacher/student)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async register(registerData) {
    try {
      // Log request for debugging
      console.log('Register request data:', JSON.stringify(registerData, null, 2));
      
      const response = await api.post('/api/Account/register', registerData);

      return {
        success: true,
        data: response.data,
        message: 'Đăng ký thành công',
      };
    } catch (error) {
      console.error('Error registering:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Extract error message from response
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        }
      }
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: errorMessage,
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Request password reset via email
   * POST /api/Account/forgot-password
   * @param {string} email - User email
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/Account/forgot-password', { email });
      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: response.data?.message || 'Email đặt lại mật khẩu đã được gửi',
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu',
      };
    }
  },

  /**
   * Reset password using reset token
   * POST /api/Account/reset-password
   * @param {object} resetData - Reset password data
   * @param {string} resetData.email - User email
   * @param {string} resetData.resetToken - Reset token from email
   * @param {string} resetData.newPassword - New password
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async resetPassword(resetData) {
    try {
      const response = await api.post('/api/Account/reset-password', resetData);
      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: response.data?.message || 'Đặt lại mật khẩu thành công',
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể đặt lại mật khẩu',
      };
    }
  },

  /**
   * Change password for logged-in user
   * POST /api/Account/change-password
   * @param {object} changePasswordData - Change password data
   * @param {string} changePasswordData.currentPassword - Current password
   * @param {string} changePasswordData.newPassword - New password
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async changePassword(changePasswordData) {
    try {
      const response = await api.post('/api/Account/change-password', changePasswordData);
      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: response.data?.message || 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể đổi mật khẩu',
      };
    }
  },

  /**
   * Refresh JWT access token
   * POST /api/Account/refresh-token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{success: boolean, data?: {token: string}, message?: string}>}
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/api/Account/refresh-token', { refreshToken });
      
      if (response.data?.data?.token || response.data?.token || response.data?.accessToken) {
        const token = response.data?.data?.token || response.data?.token || response.data?.accessToken;
        setAuthToken(token);
      }

      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: response.data?.message || 'Làm mới token thành công',
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể làm mới token',
      };
    }
  },

  /**
   * Logout and invalidate refresh tokens
   * POST /api/Account/logout
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async logout() {
    try {
      const response = await api.post('/api/Account/logout');
      // Remove token and role from localStorage and sessionStorage
      removeAuthToken();
      localStorage.removeItem('user_role');
      sessionStorage.removeItem('user_role');
      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: response.data?.message || 'Đăng xuất thành công',
      };
    } catch (error) {
      console.error('Error logging out:', error);
      // Still remove token and role even if API call fails
      removeAuthToken();
      localStorage.removeItem('user_role');
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Đăng xuất thất bại',
      };
    }
  },

  /**
   * Get current user profile
   * GET /api/Account/profile
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getProfile() {
    try {
      const response = await api.get('/api/Account/profile');
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Lấy thông tin profile thành công',
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy thông tin profile',
      };
    }
  },

  /**
   * Get paginated list of accounts (Admin only)
   * GET /api/Account?page=1&size=10
   * @param {number} page - Page number (default: 1)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getAccounts(page = 1, size = 10) {
    try {
      const response = await api.get('/api/Account', {
        params: { page, size },
      });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Lấy danh sách tài khoản thành công',
      };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy danh sách tài khoản',
      };
    }
  },

  /**
   * Get all accounts categorized by role (Admin only)
   * GET /api/Account/all
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getAllAccounts() {
    try {
      const response = await api.get('/api/Account/all');
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Lấy danh sách tất cả tài khoản thành công',
      };
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy danh sách tài khoản',
      };
    }
  },

  /**
   * Delete account by ID (Admin only - soft delete)
   * DELETE /api/Account/{id}
   * @param {number} id - Account ID
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteAccount(id) {
    try {
      const response = await api.delete(`/api/Account/${id}`);
      return {
        success: response.status === 200 || response.status === 204,
        data: response.data,
        message: response.data?.message || 'Xóa tài khoản thành công',
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể xóa tài khoản',
      };
    }
  },
};

export default accountService;

