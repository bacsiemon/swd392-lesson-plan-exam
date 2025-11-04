import api from './axios';

const lessonPlanService = {
  /**
   * Create a new lesson plan
   * POST /api/LessonPlan
   */
  async createLessonPlan(data) {
    try {
      console.log('🔍 Creating lesson plan with data:', data);
      
      // Ensure data matches backend DTO structure (PascalCase)
      const requestData = {
        Title: data.title || data.Title || '',
        CreatedByTeacher: data.createdByTeacher || data.CreatedByTeacher || 1,
        Objectives: data.objectives || data.Objectives || '',
        Description: data.description || data.Description || '',
        GradeLevel: data.gradeLevel || data.GradeLevel || 1,
        ImageUrl: data.imageUrl || data.ImageUrl || null
      };
      
      // Validate required fields
      if (!requestData.Title || !requestData.Objectives || !requestData.Description) {
        console.error('❌ Missing required fields:', requestData);
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Vui lòng điền đầy đủ: Tiêu đề, Mục tiêu và Mô tả'
        };
      }
      
      const response = await api.post('/api/LessonPlan', requestData);
      
      // Backend returns BaseResponse: { StatusCode, Message, Data: LessonPlanResponse }
      const baseResponse = response.data;
      const lessonPlanData = baseResponse.data || baseResponse.Data || baseResponse;
      
      console.log('✅ Lesson plan created:', {
        statusCode: baseResponse.statusCode || baseResponse.StatusCode,
        message: baseResponse.message || baseResponse.Message,
        lessonPlan: lessonPlanData
      });
      
      return {
        success: (baseResponse.statusCode || baseResponse.StatusCode) === 201 || response.status === 201,
        data: lessonPlanData,
        message: baseResponse.message || baseResponse.Message || 'Tạo giáo án thành công'
      };
    } catch (error) {
      console.error('❌ Error creating lesson plan:', {
        error: error,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData,
        statusCode: error.response?.status,
        message: errorData.message || errorData.Message || error.message || 'Không thể tạo giáo án'
      };
    }
  },

  /**
   * Get all lesson plans for current teacher
   * GET /api/LessonPlan/current-teacher
   */
  async getCurrentTeacherLessonPlans(params = {}) {
    try {
      const response = await api.get('/api/LessonPlan/current-teacher', { params });
      
      // Backend returns BaseResponse: { StatusCode, Message, Data: IEnumerable<LessonPlanResponse>, AdditionalData }
      // But the controller returns Ok(response), so response.data is the BaseResponse
      const baseResponse = response.data;
      
      // Log for debugging
      console.log('Get lesson plans response:', {
        httpStatus: response.status,
        responseData: baseResponse,
        statusCode: baseResponse?.StatusCode || baseResponse?.statusCode,
        message: baseResponse?.Message || baseResponse?.message,
        data: baseResponse?.Data || baseResponse?.data,
        dataType: Array.isArray(baseResponse?.Data || baseResponse?.data) ? 'array' : typeof (baseResponse?.Data || baseResponse?.data)
      });
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      // Check if StatusCode indicates success (200)
      if (responseStatusCode === 200 || response.status === 200) {
        // Extract lesson plans from Data field
        // Backend returns Data as IEnumerable<LessonPlanResponse>
        let plansData = baseResponse.Data || baseResponse.data;
        
        // Convert to array if it's not already
        if (!Array.isArray(plansData)) {
          // If it's an object with items, use items
          if (plansData && typeof plansData === 'object' && plansData.items) {
            plansData = plansData.items;
          } else if (plansData && typeof plansData === 'object') {
            // If it's a single object, wrap in array
            plansData = [plansData];
          } else {
            plansData = [];
          }
        }
        
        return {
          success: true,
          data: plansData,
          additionalData: baseResponse.AdditionalData || baseResponse.additionalData,
          message: baseResponse.Message || baseResponse.message || 'Lấy danh sách giáo án thành công'
        };
      } else {
        // Handle non-200 status codes
        console.warn('Get lesson plans returned non-success status code:', responseStatusCode);
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể tải danh sách giáo án',
          statusCode: responseStatusCode,
        };
      }
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      
      // Handle BaseResponse error format
      let errorMessage = 'Không thể tải danh sách giáo án. Vui lòng thử lại.';
      if (errorData) {
        // Check for BaseResponse format
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
   * Get lesson plan by ID
   * GET /api/LessonPlan/{id}
   */
  async getLessonPlanById(id) {
    try {
      const response = await api.get(`/api/LessonPlan/${id}`);
      
      // Backend returns BaseResponse: { StatusCode, Message, Data: LessonPlanResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      // Check if StatusCode indicates success (200)
      if (responseStatusCode === 200 || response.status === 200) {
        // Extract lesson plan from Data field
        const lessonPlanData = baseResponse.Data || baseResponse.data;
        
        return {
          success: true,
          data: lessonPlanData,
          message: baseResponse.Message || baseResponse.message || 'Lấy thông tin giáo án thành công'
        };
      } else {
        // Handle non-200 status codes
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể tải thông tin giáo án',
          statusCode: responseStatusCode,
        };
      }
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      
      const errorData = error.response?.data;
      let errorMessage = 'Không thể tải thông tin giáo án. Vui lòng thử lại.';
      
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
   * Update lesson plan
   * PUT /api/LessonPlan/{id}
   */
  async updateLessonPlan(id, data) {
    try {
      const response = await api.put(`/api/LessonPlan/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật giáo án thành công'
      };
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể cập nhật giáo án'
      };
    }
  },

  /**
   * Delete lesson plan
   * DELETE /api/LessonPlan/{id}
   */
  async deleteLessonPlan(id) {
    try {
      await api.delete(`/api/LessonPlan/${id}`);
      return {
        success: true,
        message: 'Xóa giáo án thành công'
      };
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể xóa giáo án'
      };
    }
  },

  /**
   * Upload file to lesson plan
   * POST /api/LessonPlan/{id}/upload-file
   */
  async uploadFile(lessonPlanId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type manually - axios will automatically set it with boundary for FormData
      // When axios detects FormData, it automatically sets Content-Type with boundary
      // We use transformRequest to remove the default Content-Type header so axios can set it automatically
      const response = await api.post(`/api/LessonPlan/${lessonPlanId}/upload-file`, formData, {
        transformRequest: [(data, headers) => {
          // Remove Content-Type header so axios can set it automatically with boundary for FormData
          delete headers['Content-Type'];
          return data;
        }]
      });

      // Handle backend response structure: { StatusCode, Message, Data }
      const baseResponse = response.data;
      const statusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : response.status);

      // Check if upload was successful (201 Created)
      if (statusCode === 201 || response.status === 201) {
        return {
          success: true,
          data: baseResponse.Data || baseResponse.data || baseResponse,
          message: baseResponse.Message || baseResponse.message || 'Tải lên file thành công',
          statusCode: statusCode
        };
      } else {
        // Handle non-success status codes
        const errorMsg = baseResponse.Message || baseResponse.message || 
                        baseResponse.Errors || baseResponse.errors ||
                        'Không thể tải lên file';
        return {
          success: false,
          error: baseResponse.Errors || baseResponse.errors || baseResponse,
          message: errorMsg,
          statusCode: statusCode
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorData = error.response?.data || {};
      const statusCode = error.response?.status || errorData?.StatusCode || errorData?.statusCode;
      const errorMsg = errorData.Message || errorData.message || 
                      errorData.Errors || errorData.errors ||
                      error.message || 'Không thể tải lên file';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMsg,
        statusCode: statusCode
      };
    }
  },

  /**
   * Delete file from lesson plan
   * DELETE /api/LessonPlan/files/{id}
   */
  async deleteFile(fileId) {
    try {
      await api.delete(`/api/LessonPlan/files/${fileId}`);
      return {
        success: true,
        message: 'Xóa file thành công'
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể xóa file'
      };
    }
  },
};

export default lessonPlanService;

