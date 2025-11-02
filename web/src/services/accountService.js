import api from './axios';
import { setAuthToken } from './axios';

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
        // Save token to localStorage if token is in response
        if (response.data.token || response.data.accessToken) {
          const token = response.data.token || response.data.accessToken;
          setAuthToken(token);
        }

        return {
          success: true,
          data: response.data,
          message: 'Đăng nhập thành công',
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
};

export default accountService;

