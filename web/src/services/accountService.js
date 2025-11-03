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
        Email: email,
        Password: password,
      });

      if (response.data) {
        // Backend returns BaseResponse structure: { StatusCode, Message, Data: LoginResponse }
        // LoginResponse contains: { Id, Email, FullName, Role (EUserRole enum: 0/1/2), AccessToken, RefreshToken, TokenExpiry, RefreshTokenExpiry }
        const baseResponse = response.data;
        
        // Log response for debugging
        console.log('Login response:', {
          httpStatus: response.status,
          responseData: baseResponse,
          statusCode: baseResponse?.StatusCode || baseResponse?.statusCode,
          message: baseResponse?.Message || baseResponse?.message
        });
        
        // Check BaseResponse StatusCode (200) - handle both PascalCase and camelCase
        // Backend returns PascalCase, but sometimes JSON serialization might convert it
        const responseStatusCode = baseResponse?.StatusCode !== undefined 
          ? baseResponse.StatusCode 
          : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
        
        // Check if StatusCode indicates success (200)
        if (responseStatusCode === 200) {
          // Extract LoginResponse from Data field (PascalCase)
          const loginData = baseResponse.Data || baseResponse.data;
          
          if (!loginData) {
            console.warn('Login successful but no data in response');
            return {
              success: false,
              message: baseResponse.Message || baseResponse.message || 'Đăng nhập thành công nhưng không có dữ liệu',
            };
          }
          
          // Save AccessToken to localStorage
          const accessToken = loginData.AccessToken || loginData.accessToken;
          const refreshToken = loginData.RefreshToken || loginData.refreshToken;
          
          if (accessToken) {
            setAuthToken(accessToken);
            
            // Save refresh token if available
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }
            
            // Decode token to get role and save it
            try {
              const base64Url = accessToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const decoded = JSON.parse(jsonPayload);
              const roleFromToken = decoded.role || decoded.Role || 
                          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];
              if (roleFromToken !== null && roleFromToken !== undefined) {
                localStorage.setItem('user_role', String(roleFromToken));
                sessionStorage.setItem('user_role', String(roleFromToken));
                console.log('Role saved from token:', roleFromToken);
              }
            } catch (error) {
              console.error('Error decoding token to get role:', error);
            }
          }

          // Get role from response data - Priority: Response > Token
          // Role is EUserRole enum: 0 (Admin), 1 (Teacher), 2 (Student)
          const roleFromResponse = loginData.Role !== undefined ? loginData.Role : 
                                   (loginData.role !== undefined ? loginData.role : null);
          
          if (roleFromResponse !== null && roleFromResponse !== undefined) {
            const roleToSave = String(roleFromResponse);
            localStorage.setItem('user_role', roleToSave);
            sessionStorage.setItem('user_role', roleToSave);
            console.log('Role saved from response:', roleToSave);
          }

          return {
            success: true,
            data: loginData, // Return the LoginResponse data directly
            message: baseResponse.Message || baseResponse.message || 'Đăng nhập thành công',
          };
        } else {
          // Handle non-200 status codes
          console.warn('Login returned non-success status code:', responseStatusCode);
          return {
            success: false,
            error: baseResponse,
            message: baseResponse?.Message || baseResponse?.message || 'Đăng nhập thất bại',
            statusCode: responseStatusCode,
          };
        }
      }

      return {
        success: false,
        message: 'Không nhận được dữ liệu từ server',
      };
    } catch (error) {
      console.error('Error logging in:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorData = error.response?.data;
      
      // Handle BaseResponse error format
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      if (errorData) {
        // Check for BaseResponse format
        const statusCode = errorData?.StatusCode !== undefined 
          ? errorData.StatusCode 
          : (errorData?.statusCode !== undefined ? errorData.statusCode : null);
        
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode,
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
      // Convert frontend data format to backend PascalCase format
      // Backend expects: { Email, Password, ConfirmPassword, FullName, Role, PhoneNumber?, DateOfBirth?, Bio? }
      const requestData = {
        Email: registerData.email || registerData.Email,
        Password: registerData.password || registerData.Password,
        ConfirmPassword: registerData.confirmPassword || registerData.ConfirmPassword,
        FullName: registerData.fullName || registerData.FullName,
        Role: registerData.role !== undefined ? registerData.role : registerData.Role, // EUserRole enum: 0, 1, or 2
        PhoneNumber: registerData.phoneNumber || registerData.PhoneNumber || null,
        DateOfBirth: registerData.dateOfBirth || registerData.DateOfBirth || null,
        Bio: registerData.bio || registerData.Bio || null,
      };

      // Log request for debugging
      console.log('Register request data:', JSON.stringify(requestData, null, 2));
      
      const response = await api.post('/api/Account/register', requestData);

      // Backend returns BaseResponse structure: { StatusCode, Message, Data: RegisterResponse }
      // Axios wraps the response, so we need to check response.data
      const baseResponse = response.data;
      
      // Log response for debugging
      console.log('Register response:', {
        httpStatus: response.status,
        responseData: baseResponse,
        statusCode: baseResponse?.StatusCode || baseResponse?.statusCode,
        message: baseResponse?.Message || baseResponse?.message
      });
      
      // Check BaseResponse StatusCode (200 or 201) - handle both PascalCase and camelCase
      // Backend returns PascalCase, but sometimes JSON serialization might convert it
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      // Success if BaseResponse StatusCode is 200 or 201
      // Backend returns statusCode: 201 for successful registration
      if (responseStatusCode === 201 || responseStatusCode === 200) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || baseResponse.message || 'Đăng ký thành công',
        };
      } else {
        // Handle other status codes
        console.warn('Registration returned non-success status code:', responseStatusCode);
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Đăng ký thất bại',
          statusCode: responseStatusCode,
        };
      }
    } catch (error) {
      console.error('Error registering:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Extract error message from BaseResponse format
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      const errorData = error.response?.data;
      
      if (errorData) {
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode,
      };
    }
  },

  /**
   * Register a new student account
   * POST /api/Account/register-student
   * @param {object} registerData - Registration data
   * @param {string} registerData.fullName - Full name
   * @param {string} registerData.email - Email
   * @param {string} registerData.phoneNumber - Phone number (optional)
   * @param {string} registerData.password - Password
   * @param {string} registerData.confirmPassword - Confirm password
   * @param {string} registerData.dateOfBirth - Date of birth (optional)
   * @param {string} registerData.bio - Bio (optional)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async registerStudent(registerData) {
    try {
      // Convert frontend data format to backend PascalCase format
      // Backend expects: { Email, Password, ConfirmPassword, FullName, PhoneNumber?, DateOfBirth?, Bio? }
      const requestData = {
        Email: registerData.email || registerData.Email,
        Password: registerData.password || registerData.Password,
        ConfirmPassword: registerData.confirmPassword || registerData.ConfirmPassword,
        FullName: registerData.fullName || registerData.FullName,
        PhoneNumber: registerData.phoneNumber || registerData.PhoneNumber || null,
        DateOfBirth: registerData.dateOfBirth || registerData.DateOfBirth || null,
        Bio: registerData.bio || registerData.Bio || null,
      };

      const response = await api.post('/api/Account/register-student', requestData);

      // Backend returns BaseResponse structure: { StatusCode, Message, Data: StudentRegisterResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      if (responseStatusCode === 201 || responseStatusCode === 200) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || baseResponse.message || 'Đăng ký học sinh thành công',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || baseResponse.message || 'Đăng ký học sinh thất bại',
          statusCode: responseStatusCode,
        };
      }
    } catch (error) {
      console.error('Error registering student:', error);
      const errorData = error.response?.data;
      
      // Extract error message from BaseResponse format
      let errorMessage = 'Đăng ký học sinh thất bại. Vui lòng thử lại.';
      if (errorData) {
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode,
      };
    }
  },

  /**
   * Register a new teacher account
   * POST /api/Account/register-teacher
   * @param {object} registerData - Registration data
   * @param {string} registerData.fullName - Full name
   * @param {string} registerData.email - Email
   * @param {string} registerData.schoolName - School name (required)
   * @param {string} registerData.phoneNumber - Phone number (optional)
   * @param {string} registerData.password - Password
   * @param {string} registerData.confirmPassword - Confirm password
   * @param {string} registerData.dateOfBirth - Date of birth (optional)
   * @param {string} registerData.bio - Bio (optional)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async registerTeacher(registerData) {
    try {
      // Convert frontend data format to backend PascalCase format
      // Backend expects: { Email, Password, ConfirmPassword, FullName, SchoolName (required), PhoneNumber?, DateOfBirth?, Bio? }
      const requestData = {
        Email: registerData.email || registerData.Email,
        Password: registerData.password || registerData.Password,
        ConfirmPassword: registerData.confirmPassword || registerData.ConfirmPassword,
        FullName: registerData.fullName || registerData.FullName,
        SchoolName: registerData.schoolName || registerData.SchoolName, // Required for teachers
        PhoneNumber: registerData.phoneNumber || registerData.PhoneNumber || null,
        DateOfBirth: registerData.dateOfBirth || registerData.DateOfBirth || null,
        Bio: registerData.bio || registerData.Bio || null,
      };

      const response = await api.post('/api/Account/register-teacher', requestData);

      // Backend returns BaseResponse structure: { StatusCode, Message, Data: TeacherRegisterResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      if (responseStatusCode === 201 || responseStatusCode === 200) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || baseResponse.message || 'Đăng ký giáo viên thành công',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || baseResponse.message || 'Đăng ký giáo viên thất bại',
          statusCode: responseStatusCode,
        };
      }
    } catch (error) {
      console.error('Error registering teacher:', error);
      const errorData = error.response?.data;
      
      // Extract error message from BaseResponse format
      let errorMessage = 'Đăng ký giáo viên thất bại. Vui lòng thử lại.';
      if (errorData) {
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode,
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
      const response = await api.post('/api/Account/forgot-password', { Email: email });
      
      // Backend returns BaseResponse structure
      const baseResponse = response.data;
      
      if (baseResponse.StatusCode === 200 || baseResponse.StatusCode === 201) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || 'Email đặt lại mật khẩu đã được gửi',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || 'Không thể gửi email đặt lại mật khẩu',
          statusCode: baseResponse.StatusCode,
        };
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể gửi email đặt lại mật khẩu';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode,
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
      // Convert to PascalCase format expected by backend
      const requestData = {
        Email: resetData.email || resetData.Email,
        ResetToken: resetData.resetToken || resetData.ResetToken,
        NewPassword: resetData.newPassword || resetData.NewPassword,
      };
      
      const response = await api.post('/api/Account/reset-password', requestData);
      
      // Backend returns BaseResponse structure
      const baseResponse = response.data;
      
      if (baseResponse.StatusCode === 200 || baseResponse.StatusCode === 201) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || 'Đặt lại mật khẩu thành công',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || 'Không thể đặt lại mật khẩu',
          statusCode: baseResponse.StatusCode,
        };
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể đặt lại mật khẩu';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode,
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
      // Convert to PascalCase format expected by backend
      const requestData = {
        CurrentPassword: changePasswordData.currentPassword || changePasswordData.CurrentPassword,
        NewPassword: changePasswordData.newPassword || changePasswordData.NewPassword,
      };
      
      const response = await api.post('/api/Account/change-password', requestData);
      
      // Backend returns BaseResponse structure
      const baseResponse = response.data;
      
      if (baseResponse.StatusCode === 200 || baseResponse.StatusCode === 201) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || 'Đổi mật khẩu thành công',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || 'Không thể đổi mật khẩu',
          statusCode: baseResponse.StatusCode,
        };
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể đổi mật khẩu';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode,
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
      const response = await api.post('/api/Account/refresh-token', { RefreshToken: refreshToken });
      
      // Backend returns BaseResponse structure
      const baseResponse = response.data;
      
      if (baseResponse.StatusCode === 200 || baseResponse.StatusCode === 201) {
        const tokenData = baseResponse.Data || baseResponse.data;
        
        // Save new access token if available
        const accessToken = tokenData?.AccessToken || tokenData?.accessToken || tokenData?.Token || tokenData?.token;
        if (accessToken) {
          setAuthToken(accessToken);
          
          // Save new refresh token if available
          const newRefreshToken = tokenData?.RefreshToken || tokenData?.refreshToken;
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
        }

        return {
          success: true,
          data: tokenData,
          message: baseResponse.Message || 'Làm mới token thành công',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || 'Không thể làm mới token',
          statusCode: baseResponse.StatusCode,
        };
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể làm mới token';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode,
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
      
      // Backend returns BaseResponse structure
      const baseResponse = response.data;
      
      // Remove token and role from localStorage and sessionStorage
      removeAuthToken();
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      sessionStorage.removeItem('user_role');
      
      if (baseResponse.StatusCode === 200 || baseResponse.StatusCode === 201) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data,
          message: baseResponse.Message || 'Đăng xuất thành công',
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse.Message || 'Đăng xuất thất bại',
          statusCode: baseResponse.StatusCode,
        };
      }
    } catch (error) {
      console.error('Error logging out:', error);
      // Still remove token and role even if API call fails
      removeAuthToken();
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      sessionStorage.removeItem('user_role');
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.Message || errorData?.message || 'Đăng xuất thất bại';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode,
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
      
      // Backend returns BaseResponse structure: { StatusCode, Message, Data: AccountResponse }
      const baseResponse = response.data;
      
      // Log response for debugging
      console.log('Get profile response:', {
        httpStatus: response.status,
        responseData: baseResponse,
        statusCode: baseResponse?.StatusCode || baseResponse?.statusCode,
        message: baseResponse?.Message || baseResponse?.message,
        data: baseResponse?.Data || baseResponse?.data
      });
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      // Check if StatusCode indicates success (200)
      if (responseStatusCode === 200) {
        // Extract AccountResponse from Data field
        const profileData = baseResponse.Data || baseResponse.data;
        
        if (!profileData) {
          console.warn('Profile response successful but no data in response');
          return {
            success: false,
            message: baseResponse.Message || baseResponse.message || 'Lấy thông tin profile thành công nhưng không có dữ liệu',
          };
        }
        
        return {
          success: true,
          data: profileData,
          message: baseResponse.Message || baseResponse.message || 'Lấy thông tin profile thành công',
        };
      } else {
        // Handle non-200 status codes
        console.warn('Get profile returned non-success status code:', responseStatusCode);
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể lấy thông tin profile',
          statusCode: responseStatusCode,
        };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorData = error.response?.data;
      
      // Handle BaseResponse error format
      let errorMessage = 'Không thể lấy thông tin profile. Vui lòng thử lại.';
      if (errorData) {
        // Check for BaseResponse format
        const statusCode = errorData?.StatusCode !== undefined 
          ? errorData.StatusCode 
          : (errorData?.statusCode !== undefined ? errorData.statusCode : null);
        
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode,
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

