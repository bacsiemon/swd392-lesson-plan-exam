// Service để gọi API liên quan đến Question Bank
import api from './axios';

// Question Bank Services
export const questionBankService = {
  /**
   * GET /api/question-banks
   * Get paginated list of question banks
   * Query params: teacherId?, gradeLevel?, status?, q?, page, size
   */
  async getQuestionBanks(params = {}) {
    try {
      const {
        page = 1,
        pageSize = 10,
        gradeLevel,
        status,
        search,
        teacherId
      } = params;

      // Ensure page and pageSize are positive integers
      const pageNum = Math.max(1, parseInt(page) || 1);
      const sizeNum = Math.max(1, parseInt(pageSize) || 10);

      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        size: sizeNum.toString()
      });

      // Always include 'q' parameter, even if empty, to avoid validation errors
      // Backend expects 'q' to be present (even if empty string)
      queryParams.append('q', search && search.trim() ? search.trim() : '');

      if (gradeLevel !== undefined && gradeLevel !== null) {
        queryParams.append('gradeLevel', gradeLevel.toString());
      }
      if (status !== undefined && status !== null) {
        queryParams.append('status', status.toString());
      }
      if (teacherId !== undefined && teacherId !== null) {
        queryParams.append('teacherId', teacherId.toString());
      }

      const queryString = queryParams.toString();
      const fullUrl = `/api/question-banks?${queryString}`;
      
      console.log('Fetching question banks with params:', {
        page: pageNum,
        size: sizeNum,
        gradeLevel,
        status,
        search,
        teacherId,
        url: fullUrl
      });

      const response = await api.get(fullUrl);

      // Backend returns BaseResponse: { StatusCode, Message, Data: QuestionBankListItem[], AdditionalData: PaginationInfo }
      const baseResponse = response.data;
      
      console.log('Get question banks response:', {
        httpStatus: response.status,
        responseData: baseResponse,
        statusCode: baseResponse?.StatusCode || baseResponse?.statusCode,
        message: baseResponse?.Message || baseResponse?.message,
        hasData: !!baseResponse?.Data || !!baseResponse?.data
      });
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const items = baseResponse.Data || baseResponse.data || [];
      const paginationInfo = baseResponse.AdditionalData || baseResponse.additionalData || {};

      if (responseStatusCode === 200) {
        return {
          success: true,
          data: Array.isArray(items) ? items : [],
          pagination: {
            current: paginationInfo.Page || paginationInfo.page || pageNum,
            pageSize: paginationInfo.Size || paginationInfo.size || sizeNum,
            total: paginationInfo.Total || paginationInfo.total || items.length,
            totalPages: paginationInfo.TotalPages || paginationInfo.totalPages || Math.ceil((paginationInfo.Total || paginationInfo.total || items.length) / (paginationInfo.Size || paginationInfo.size || sizeNum)),
            ...paginationInfo
          },
          message: baseResponse.Message || baseResponse.message || 'Lấy danh sách ngân hàng câu hỏi thành công'
        };
      } else {
        console.warn('Get question banks returned non-success status:', responseStatusCode, baseResponse);
        return {
          success: false,
          data: [],
          pagination: { current: pageNum, pageSize: sizeNum, total: 0 },
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || baseResponse?.Errors || 'Không thể tải danh sách ngân hàng câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error fetching question banks:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      const errorData = error.response?.data || {};
      
      // Handle validation errors (400)
      if (error.response?.status === 400) {
        const validationMessage = errorData?.Message || errorData?.message || errorData?.Errors || 'Tham số không hợp lệ. Vui lòng kiểm tra lại page và size.';
        return {
          success: false,
          data: [],
          pagination: { current: params.page || 1, pageSize: params.pageSize || 10, total: 0 },
          error: errorData,
          message: validationMessage,
          statusCode: 400
        };
      }
      
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể tải danh sách ngân hàng câu hỏi';
      
      return {
        success: false,
        data: [],
        pagination: { current: params.page || 1, pageSize: params.pageSize || 10, total: 0 },
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * POST /api/question-banks
   * Create a new question bank
   * Request: { Name, GradeLevel, TeacherId, Description }
   */
  async createQuestionBank(data) {
    try {
      // Get current teacher ID from token
      const token = localStorage.getItem('auth_token');
      let teacherId = data.teacherId || data.TeacherId;

      if (!teacherId && token) {
        try {
          // Try to decode token to get user ID
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          // Try different claim names that might contain user ID
          // Backend JwtService includes: ClaimTypes.NameIdentifier, "userId", "sub", "id"
          const userId = decoded.userId || 
                         decoded.sub || 
                         decoded.id || 
                         decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                         decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'];
          
          if (userId) {
            teacherId = parseInt(userId);
            console.log('Extracted teacherId from token:', teacherId, 'from claims:', decoded);
          } else {
            console.warn('Could not find userId in token claims:', decoded);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      
      // If still no teacherId, try to get from API endpoint
      if (!teacherId && token) {
        try {
          const response = await api.get('/api/test/current-user');
          const baseResponse = response.data;
          const userData = baseResponse?.Data || baseResponse?.data || {};
          if (userData?.userId || userData?.UserId) {
            teacherId = parseInt(userData.userId || userData.UserId);
            console.log('Got teacherId from API:', teacherId);
          } else {
            console.warn('API endpoint did not return userId:', userData);
          }
        } catch (error) {
          console.warn('Could not get userId from API endpoint:', error.response?.data || error.message);
          // Don't throw error here, let validation handle it
        }
      }
      
      // Final check: if still no teacherId, it will be caught by validation below

      // Map frontend data to backend DTO structure
      // Backend sample shows camelCase, but ASP.NET Core accepts both camelCase and PascalCase
      // We'll send camelCase to match the sample in controller comments
      const requestData = {
        name: (data.name || data.Name || '').trim(),
        gradeLevel: data.gradeLevel !== undefined ? (typeof data.gradeLevel === 'number' ? data.gradeLevel : parseInt(data.gradeLevel) || 1) : (data.GradeLevel !== undefined ? (typeof data.GradeLevel === 'number' ? data.GradeLevel : parseInt(data.GradeLevel) || 1) : 1),
        teacherId: teacherId || data.teacherId || data.TeacherId,
        description: data.description || data.Description || null // Backend accepts null or empty string
      };

      // Validate required fields
      if (!requestData.name || requestData.name.trim() === '') {
        return {
          success: false,
          error: { Message: 'INVALID_NAME' },
          message: 'Tên ngân hàng câu hỏi không được để trống',
          statusCode: 400
        };
      }

      if (!requestData.teacherId || requestData.teacherId <= 0 || !Number.isInteger(requestData.teacherId)) {
        console.error('Invalid TeacherId:', requestData.teacherId, 'Extracted from token:', teacherId);
        return {
          success: false,
          error: { Message: 'INVALID_TEACHER_ID' },
          message: 'Không thể xác định Teacher ID. Vui lòng đăng nhập lại.',
          statusCode: 400
        };
      }

      if (requestData.gradeLevel <= 0 || !Number.isInteger(requestData.gradeLevel)) {
        return {
          success: false,
          error: { Message: 'INVALID_GRADE_LEVEL' },
          message: 'Grade Level phải là số nguyên lớn hơn 0',
          statusCode: 400
        };
      }

      console.log('Creating question bank with data:', {
        ...requestData,
        teacherIdType: typeof requestData.teacherId,
        teacherIdValue: requestData.teacherId
      });

      const response = await api.post('/api/question-banks', requestData);

      // Backend returns BaseResponse: { StatusCode, Message, Data: QuestionBankResponse }
      const baseResponse = response.data;
      
      console.log('Create question bank response:', {
        httpStatus: response.status,
        responseData: baseResponse,
        statusCode: baseResponse?.StatusCode || baseResponse?.statusCode,
        message: baseResponse?.Message || baseResponse?.message,
        errors: baseResponse?.Errors || baseResponse?.errors
      });
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const questionBankData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 201 || responseStatusCode === 200) {
        const createdBankId = questionBankData?.Id || questionBankData?.id;
        
        // Automatically set status to Active (1) after creation
        // This removes the need for approval workflow - questions are immediately available
        if (createdBankId) {
          try {
            const statusResult = await this.updateQuestionBankStatus(createdBankId, 1); // 1 = Active
            if (statusResult.success) {
              console.log('Auto-activated question bank:', createdBankId);
              // Update questionBankData with Active status
              if (questionBankData) {
                questionBankData.StatusEnum = 1;
                questionBankData.statusEnum = 1;
              }
            } else {
              console.warn('Failed to auto-activate question bank:', statusResult.message);
              // Don't fail the creation if status update fails
            }
          } catch (statusError) {
            console.error('Error auto-activating question bank:', statusError);
            // Don't fail the creation if status update fails
          }
        }
        
        return {
          success: true,
          data: questionBankData,
          message: baseResponse.Message || baseResponse.message || 'Tạo ngân hàng câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể tạo ngân hàng câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error creating question bank:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorData = error.response?.data || {};
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const validationMessage = errorData?.Message || errorData?.message || errorData?.Errors || 'Dữ liệu không hợp lệ';
        return {
          success: false,
          error: errorData,
          message: validationMessage,
          statusCode: 400
        };
      }
      
      // Handle server errors
      if (error.response?.status === 500) {
        // Try to extract error details from backend
        const errorMessage = errorData?.Message || errorData?.message || 'INTERNAL_SERVER_ERROR';
        const errorDetails = errorData?.Errors || errorData?.errors || errorData?.Error || '';
        
        // Check for common database errors
        let userFriendlyMessage = 'Lỗi server. Vui lòng kiểm tra lại thông tin và thử lại.';
        
        if (errorDetails) {
          const errorStr = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails);
          
          // Check for foreign key constraint violation
          if (errorStr.includes('foreign key') || errorStr.includes('TeacherId') || errorStr.includes('teacher_id')) {
            userFriendlyMessage = 'Teacher ID không hợp lệ hoặc không tồn tại trong hệ thống. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.';
          } else if (errorStr.includes('duplicate') || errorStr.includes('unique')) {
            userFriendlyMessage = 'Ngân hàng câu hỏi với tên này đã tồn tại. Vui lòng chọn tên khác.';
          } else if (errorStr.includes('constraint') || errorStr.includes('violation')) {
            userFriendlyMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
          }
          
          console.error('Backend error details:', {
            message: errorMessage,
            errors: errorDetails,
            fullError: errorStr
          });
        }
        
        return {
          success: false,
          error: errorData,
          message: userFriendlyMessage,
          statusCode: 500,
          errorDetails: errorDetails
        };
      }
      
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể tạo ngân hàng câu hỏi';
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * PUT /api/question-banks/{id}
   * Update question bank
   * Request: { Name, GradeLevel, Description }
   */
  async updateQuestionBank(id, data) {
    try {
      // Map frontend data to backend DTO structure (PascalCase)
      const requestData = {
        Name: data.name || data.Name || '',
        GradeLevel: data.gradeLevel !== undefined ? data.gradeLevel : (data.GradeLevel !== undefined ? data.GradeLevel : 1),
        Description: data.description || data.Description || ''
      };

      const response = await api.put(`/api/question-banks/${id}`, requestData);

      // Backend returns BaseResponse: { StatusCode, Message, Data: QuestionBankResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const questionBankData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 200) {
        return {
          success: true,
          data: questionBankData,
          message: baseResponse.Message || baseResponse.message || 'Cập nhật ngân hàng câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể cập nhật ngân hàng câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error updating question bank:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể cập nhật ngân hàng câu hỏi';
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * PATCH /api/question-banks/{id}/status
   * Update question bank status
   * Request: { StatusEnum }
   */
  async updateQuestionBankStatus(id, statusEnum) {
    try {
      const requestData = {
        StatusEnum: statusEnum
      };

      const response = await api.patch(`/api/question-banks/${id}/status`, requestData);

      // Backend returns BaseResponse: { StatusCode, Message, Data: QuestionBankResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const questionBankData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 200) {
        return {
          success: true,
          data: questionBankData,
          message: baseResponse.Message || baseResponse.message || 'Cập nhật trạng thái thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể cập nhật trạng thái',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error updating question bank status:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể cập nhật trạng thái';
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * GET /api/question-banks/{id}
   * Get question bank by ID
   */
  async getQuestionBankById(id) {
    try {
      const response = await api.get(`/api/question-banks/${id}`);

      // Backend returns BaseResponse: { StatusCode, Message, Data: QuestionBankResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const questionBankData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 200) {
        return {
          success: true,
          data: questionBankData,
          message: baseResponse.Message || baseResponse.message || 'Lấy thông tin ngân hàng câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể tải thông tin ngân hàng câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error fetching question bank:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể tải thông tin ngân hàng câu hỏi';
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * GET /api/question-banks/{id}/stats
   * Get statistics for a question bank
   */
  async getQuestionBankStats(id) {
    try {
      const response = await api.get(`/api/question-banks/${id}/stats`);

      // Backend returns BaseResponse: { StatusCode, Message, Data: QuestionBankStatsResponse }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const statsData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 200) {
        return {
          success: true,
          data: statsData,
          message: baseResponse.Message || baseResponse.message || 'Lấy thống kê thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể tải thống kê',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error fetching question bank stats:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể tải thống kê';
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * POST /api/question-banks/{id}/import
   * Import questions into question bank
   * Request: { Items: ImportQuestionItem[] }
   */
  async importQuestions(questionBankId, items) {
    try {
      const requestData = {
        QuestionBankId: questionBankId,
        Items: items.map(item => ({
          Title: item.title || item.Title || '',
          Content: item.content || item.Content || '',
          QuestionTypeEnum: item.questionTypeEnum !== undefined ? item.questionTypeEnum : (item.QuestionTypeEnum !== undefined ? item.QuestionTypeEnum : 0),
          QuestionDifficultyId: item.questionDifficultyId !== undefined ? item.questionDifficultyId : (item.QuestionDifficultyId !== undefined ? item.QuestionDifficultyId : null),
          Domain: item.domain || item.Domain || null,
          MultipleChoiceAnswers: (item.multipleChoiceAnswers || item.MultipleChoiceAnswers || []).map(ans => ({
            AnswerText: ans.answerText || ans.AnswerText || '',
            IsCorrect: ans.isCorrect !== undefined ? ans.isCorrect : (ans.IsCorrect !== undefined ? ans.IsCorrect : false),
            Explanation: ans.explanation || ans.Explanation || null,
            OrderIndex: ans.orderIndex !== undefined ? ans.orderIndex : (ans.OrderIndex !== undefined ? ans.OrderIndex : null)
          })),
          FillBlankAnswers: (item.fillBlankAnswers || item.FillBlankAnswers || []).map(ans => ({
            CorrectAnswer: ans.correctAnswer || ans.CorrectAnswer || '',
            NormalizedCorrectAnswer: ans.normalizedCorrectAnswer || ans.NormalizedCorrectAnswer || null,
            Explanation: ans.explanation || ans.Explanation || null
          })),
          AdditionalData: item.additionalData || item.AdditionalData || null
        }))
      };

      const response = await api.post(`/api/question-banks/${questionBankId}/import`, requestData);

      // Backend returns BaseResponse: { StatusCode, Message, Data: { Inserted } }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const importData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 201 || responseStatusCode === 200) {
        return {
          success: true,
          data: importData,
          message: baseResponse.Message || baseResponse.message || 'Nhập câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể nhập câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể nhập câu hỏi';
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * GET /api/question-banks/{id}/export
   * Export questions from question bank
   */
  async exportQuestions(questionBankId) {
    try {
      const response = await api.get(`/api/question-banks/${questionBankId}/export`);

      // Backend returns BaseResponse: { StatusCode, Message, Data: IEnumerable<object> }
      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      const exportData = baseResponse.Data || baseResponse.data;

      if (responseStatusCode === 200) {
        return {
          success: true,
          data: exportData,
          message: baseResponse.Message || baseResponse.message || 'Xuất câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể xuất câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error exporting questions:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể xuất câu hỏi';
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  },

  /**
   * DELETE /api/question-banks/{id}
   * Delete question bank (if API supports it)
   * Note: This might not be in the API list, but keeping for backward compatibility
   */
  async deleteQuestionBank(id) {
    try {
      // Check if delete endpoint exists
      const response = await api.delete(`/api/question-banks/${id}`);

      const baseResponse = response.data;
      
      // Handle both PascalCase and camelCase
      const responseStatusCode = baseResponse?.StatusCode !== undefined 
        ? baseResponse.StatusCode 
        : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : null);
      
      if (responseStatusCode === 200 || responseStatusCode === 204) {
        return {
          success: true,
          message: baseResponse.Message || baseResponse.message || 'Xóa ngân hàng câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: baseResponse,
          message: baseResponse?.Message || baseResponse?.message || 'Không thể xóa ngân hàng câu hỏi',
          statusCode: responseStatusCode
        };
      }
    } catch (error) {
      console.error('Error deleting question bank:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.Message || errorData?.message || 'Không thể xóa ngân hàng câu hỏi';
      
      // If delete endpoint doesn't exist, return error
      if (error.response?.status === 404) {
        return {
          success: false,
          error: errorData,
          message: 'API xóa không tồn tại. Vui lòng cập nhật trạng thái thành Archived thay vì xóa.',
          statusCode: 404
        };
      }
      
      return {
        success: false,
        error: errorData,
        message: errorMessage,
        statusCode: error.response?.status || errorData?.StatusCode || errorData?.statusCode
      };
    }
  }
};

// Question Services (for backward compatibility - these should be in a separate service file)
export const questionService = {
  async getQuestions(questionBankId, params = {}) {
    try {
      // This should call the Question API, not QuestionBank API
      // Placeholder - implement when Question API is integrated
      console.warn('getQuestions: Use questionService from questionService.js instead');
      return {
        success: false,
        message: 'Please use questionService from questionService.js'
      };
    } catch (error) {
      console.error('Error fetching questions:', error);
      return { success: false, message: 'Không thể tải danh sách câu hỏi' };
    }
  },

  async createQuestion(data) {
    try {
      // Placeholder - implement when Question API is integrated
      console.warn('createQuestion: Use questionService from questionService.js instead');
      return {
        success: false,
        message: 'Please use questionService from questionService.js'
      };
    } catch (error) {
      console.error('Error creating question:', error);
      return { success: false, message: 'Không thể tạo câu hỏi' };
    }
  },

  async updateQuestion(id, data) {
    try {
      // Placeholder - implement when Question API is integrated
      console.warn('updateQuestion: Use questionService from questionService.js instead');
        return {
        success: false,
        message: 'Please use questionService from questionService.js'
        };
    } catch (error) {
      console.error('Error updating question:', error);
      return { success: false, message: 'Không thể cập nhật câu hỏi' };
    }
  },

  async deleteQuestion(id) {
    try {
      // Placeholder - implement when Question API is integrated
      console.warn('deleteQuestion: Use questionService from questionService.js instead');
        return {
        success: false,
        message: 'Please use questionService from questionService.js'
        };
    } catch (error) {
      console.error('Error deleting question:', error);
      return { success: false, message: 'Không thể xóa câu hỏi' };
    }
  },

  async getQuestionById(id) {
    try {
      // Placeholder - implement when Question API is integrated
      console.warn('getQuestionById: Use questionService from questionService.js instead');
        return {
        success: false,
        message: 'Please use questionService from questionService.js'
        };
    } catch (error) {
      console.error('Error fetching question:', error);
      return { success: false, message: 'Không thể tải thông tin câu hỏi' };
    }
  }
};
