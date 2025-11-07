import api from './axios';

/**
 * Question Difficulty Service - Handles all API calls related to question difficulties
 * Based on QuestionDifficultyController.cs endpoints
 * 
 * GET /api/question-difficulties?domain={domain}&difficultyLevel={level}&page={page}&size={size}
 * GET /api/question-difficulties/{id}
 * POST /api/question-difficulties
 * PUT /api/question-difficulties/{id}
 * DELETE /api/question-difficulties/{id}
 */
const questionDifficultyService = {
  /**
   * Get all question difficulties with optional filters
   * GET /api/question-difficulties?domain={domain}&difficultyLevel={level}&page={page}&size={size}
   * @param {object} filters - Optional filters: { domain?: string, difficultyLevel?: number, page?: number, size?: number }
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getAllQuestionDifficulties(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.domain !== undefined && filters.domain !== null && filters.domain.trim() !== '') {
        params.append('domain', filters.domain.trim());
      }
      if (filters.difficultyLevel !== undefined && filters.difficultyLevel !== null) {
        params.append('difficultyLevel', filters.difficultyLevel.toString());
      }
      if (filters.page !== undefined && filters.page !== null) {
        params.append('page', filters.page.toString());
      }
      if (filters.size !== undefined && filters.size !== null) {
        params.append('size', filters.size.toString());
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/question-difficulties?${queryString}` : '/api/question-difficulties';
      
      const response = await api.get(url);

      if (response.status === 200) {
        // Backend returns BaseResponse structure: { StatusCode: 200, Message: "SUCCESS", Data: [...], AdditionalData: {...} }
        // Data is directly an array of QuestionDifficultyListItem
        let data = [];
        
        console.log('QuestionDifficultyService - Raw response:', response);
        console.log('QuestionDifficultyService - response.status:', response.status);
        console.log('QuestionDifficultyService - response.data:', response.data);
        console.log('QuestionDifficultyService - response.data type:', typeof response.data);
        console.log('QuestionDifficultyService - response.data isArray:', Array.isArray(response.data));
        
        if (response.data) {
          // Try multiple ways to extract data
          // 1. Check if response.data is directly an array
          if (Array.isArray(response.data)) {
            data = response.data;
            console.log('QuestionDifficultyService - Found array directly in response.data');
          }
          // 2. Check statusCode/StatusCode and data/Data property (handle both camelCase and PascalCase)
          else if (response.data.statusCode !== undefined || response.data.StatusCode !== undefined) {
            const statusCode = response.data.statusCode || response.data.StatusCode;
            console.log('QuestionDifficultyService - statusCode:', statusCode);
            
            if (statusCode === 200) {
              // Data can be in 'data' (camelCase) or 'Data' (PascalCase)
              const responseData = response.data.data || response.data.Data;
              
              if (responseData !== undefined) {
                if (Array.isArray(responseData)) {
                  data = responseData;
                  console.log('QuestionDifficultyService - Found array in response.data.data/Data');
                } else if (responseData.Items && Array.isArray(responseData.Items)) {
                  // Fallback: if Data has Items property
                  data = responseData.Items;
                  console.log('QuestionDifficultyService - Found array in response.data.Data.Items');
                } else if (typeof responseData === 'object' && responseData !== null) {
                  // Try to convert object to array if it's a single item
                  console.log('QuestionDifficultyService - Data is object, trying to convert:', responseData);
                  data = [responseData];
                }
              }
            } else {
              // statusCode is not 200
              console.error('QuestionDifficultyService - statusCode is not 200:', statusCode);
              return {
                success: false,
                error: response.data,
                message: response.data.message || response.data.Message || 'Lấy danh sách độ khó thất bại',
                statusCode: statusCode
              };
            }
          }
          // 3. Try to find data in nested structure (camelCase)
          else if (response.data.data && Array.isArray(response.data.data)) {
            data = response.data.data;
            console.log('QuestionDifficultyService - Found array in response.data.data');
          }
        }
        
        console.log('QuestionDifficultyService - Final parsed data:', data);
        console.log('QuestionDifficultyService - Data length:', data.length);
        console.log('QuestionDifficultyService - Data isArray:', Array.isArray(data));
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.warn('QuestionDifficultyService - Data is not an array, converting to empty array');
          data = [];
        }
        
        return {
          success: true,
          data: data,
          message: 'Lấy danh sách độ khó thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy danh sách độ khó thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error getting question difficulties:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Lấy danh sách độ khó thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      return {
        success: false,
        error: errorData,
        message: errorMessage
      };
    }
  },

  /**
   * Get question difficulty by ID
   * GET /api/question-difficulties/{id}
   * @param {number|string} id - Question difficulty ID
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getQuestionDifficultyById(id) {
    try {
      const response = await api.get(`/api/question-difficulties/${id}`);

      if (response.status === 200) {
        // Backend returns BaseResponse with Data
        const data = response.data?.Data || response.data;
        
        return {
          success: true,
          data: data,
          message: 'Lấy thông tin độ khó thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy thông tin độ khó thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error getting question difficulty by ID:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Lấy thông tin độ khó thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      return {
        success: false,
        error: errorData,
        message: errorMessage
      };
    }
  },

  /**
   * Create a new question difficulty
   * POST /api/question-difficulties
   * @param {object} difficultyData - Difficulty data: { domain: string, difficultyLevel: number, description?: string }
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async createQuestionDifficulty(difficultyData) {
    try {
      const requestData = {
        domain: difficultyData.domain || difficultyData.Domain || '',
        difficultyLevel: difficultyData.difficultyLevel !== undefined 
          ? difficultyData.difficultyLevel 
          : (difficultyData.DifficultyLevel !== undefined ? difficultyData.DifficultyLevel : 1),
        description: difficultyData.description || difficultyData.Description || null
      };

      const response = await api.post('/api/question-difficulties', requestData);

      if (response.status === 201 || response.status === 200) {
        const data = response.data?.Data || response.data;
        
        return {
          success: true,
          data: data,
          message: 'Tạo độ khó thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Tạo độ khó thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error creating question difficulty:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Tạo độ khó thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          errorMessage = errorMessages.join(', ');
        }
      }
      
      return {
        success: false,
        error: errorData,
        message: errorMessage
      };
    }
  },

  /**
   * Update question difficulty by ID
   * PUT /api/question-difficulties/{id}
   * @param {number|string} id - Question difficulty ID
   * @param {object} difficultyData - Difficulty update data: { domain: string, difficultyLevel: number, description?: string }
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async updateQuestionDifficulty(id, difficultyData) {
    try {
      const requestData = {
        domain: difficultyData.domain || difficultyData.Domain || '',
        difficultyLevel: difficultyData.difficultyLevel !== undefined 
          ? difficultyData.difficultyLevel 
          : (difficultyData.DifficultyLevel !== undefined ? difficultyData.DifficultyLevel : 1),
        description: difficultyData.description || difficultyData.Description || null
      };

      const response = await api.put(`/api/question-difficulties/${id}`, requestData);

      if (response.status === 200) {
        const data = response.data?.Data || response.data;
        
        return {
          success: true,
          data: data,
          message: 'Cập nhật độ khó thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật độ khó thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating question difficulty:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật độ khó thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          errorMessage = errorMessages.join(', ');
        }
      }
      
      return {
        success: false,
        error: errorData,
        message: errorMessage
      };
    }
  },

  /**
   * Delete question difficulty by ID
   * DELETE /api/question-difficulties/{id}
   * @param {number|string} id - Question difficulty ID
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteQuestionDifficulty(id) {
    try {
      const response = await api.delete(`/api/question-difficulties/${id}`);

      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Xóa độ khó thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Xóa độ khó thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error deleting question difficulty:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Xóa độ khó thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      return {
        success: false,
        error: errorData,
        message: errorMessage
      };
    }
  }
};

export default questionDifficultyService;

