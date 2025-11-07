import api from './axios';

/**
 * Helper function to format answer IDs
 * @param {number|number[]|string} answerIds - Single ID, array of IDs, or comma-separated string
 * @returns {string|null} Comma-separated string of IDs or null
 */
const formatAnswerIds = (answerIds) => {
  if (answerIds == null) return null;
  
  if (Array.isArray(answerIds)) {
    return answerIds.join(',');
  }
  
  if (typeof answerIds === 'number') {
    return String(answerIds);
  }
  
  if (typeof answerIds === 'string') {
    return answerIds;
  }
  
  return null;
};

const examAttemptService = {
  /**
   * Start a new exam attempt
   * POST /api/exams/{examId}/attempts/start
   * @param {number} examId - The exam ID
   * @param {string} [password] - Optional password for protected exams
   */
  async startAttempt(examId, password = null) {
    try {
      console.log('Starting exam attempt:', { examId, hasPassword: !!password });
      const params = password ? { password } : {};
      const response = await api.post(`/api/exams/${examId}/attempts/start`, null, { params });
      
      console.log('Start attempt success:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Bắt đầu bài thi thành công'
      };
    } catch (error) {
      console.error('Error starting exam attempt:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      const errorData = error.response?.data;
      let errorMessage = 'Không thể bắt đầu bài thi';
      
      // Handle BaseResponse format (from ExceptionMiddleware)
      if (errorData) {
        if (errorData.StatusCode === 500 || error.response?.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
          // Log the actual error for debugging
          if (errorData.Errors) {
            console.error('Server error details:', errorData.Errors);
          }
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        // BadRequest - could be password error, attempt limit, etc.
        if (errorData?.Message === 'CANNOT_START_ATTEMPT') {
          errorMessage = 'Không thể bắt đầu bài thi. Vui lòng kiểm tra mật khẩu, thời gian làm bài hoặc số lần làm bài còn lại.';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Bạn cần đăng nhập để làm bài thi';
      }
      
      return {
        success: false,
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Get all attempts for an exam
   * GET /api/exams/{examId}/attempts?status={status}
   * @param {number} examId - The exam ID
   * @param {number} [status] - Optional status filter (EAttemptStatus enum value)
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getExamAttempts(examId, status = null) {
    try {
      const params = {};
      if (status !== null && status !== undefined) {
        params.status = status;
      }
      
      const response = await api.get(`/api/exams/${examId}/attempts`, { params });
      
      if (response.status === 200) {
        // Backend returns array directly
        const attempts = Array.isArray(response.data) ? response.data : [];
        return {
          success: true,
          data: attempts,
          message: 'Lấy danh sách attempts thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy danh sách attempts thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error getting exam attempts:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Lấy danh sách attempts thất bại. Vui lòng thử lại.';
      
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
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Submit an answer for a question
   * POST /api/exams/{examId}/attempts/{attemptId}/answer
   * @param {number} examId - The exam ID
   * @param {number} attemptId - The attempt ID
   * @param {Object} answerData - Answer data
   * @param {number} answerData.questionId - Question ID (Required)
   * @param {number|number[]} [answerData.selectedAnswerIds] - Answer ID(s) for MCQ - will be converted to array
   * @param {string} [answerData.textAnswer] - Text answer for fill-in-the-blank
   * @param {string} [answerData.answerData] - Additional data (JSON string)
   */
  async submitAnswer(examId, attemptId, answerData) {
    try {
      // Validate inputs
      if (!examId || !attemptId) {
        return {
          success: false,
          error: 'ExamId and AttemptId are required',
          message: 'ExamId và AttemptId không được để trống'
        };
      }

      // Validate questionId is provided
      if (!answerData || !answerData.questionId) {
        return {
          success: false,
          error: 'QuestionId is required',
          message: 'QuestionId không được để trống'
        };
      }

      // Ensure questionId is a number
      const numericQuestionId = typeof answerData.questionId === 'number' ? answerData.questionId : parseInt(answerData.questionId);
      
      if (isNaN(numericQuestionId)) {
        return {
          success: false,
          error: 'Invalid questionId',
          message: 'QuestionId không hợp lệ'
        };
      }

      // Format selectedAnswerIds to array (backend expects List<int>)
      let selectedAnswerIds = null;
      
      if (answerData.selectedAnswerIds != null) {
        if (Array.isArray(answerData.selectedAnswerIds)) {
          // Already an array, ensure all are numbers
          selectedAnswerIds = answerData.selectedAnswerIds.map(id => 
            typeof id === 'number' ? id : parseInt(id)
          ).filter(id => !isNaN(id));
        } else if (typeof answerData.selectedAnswerIds === 'number') {
          // Single number, convert to array
          selectedAnswerIds = [answerData.selectedAnswerIds];
        } else if (typeof answerData.selectedAnswerIds === 'string') {
          // String (could be comma-separated or single ID)
          const parsed = answerData.selectedAnswerIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          selectedAnswerIds = parsed.length > 0 ? parsed : null;
        }
      } else if (answerData.answerIds != null) {
        // Legacy support: answerIds field
        if (Array.isArray(answerData.answerIds)) {
          selectedAnswerIds = answerData.answerIds.map(id => 
            typeof id === 'number' ? id : parseInt(id)
          ).filter(id => !isNaN(id));
        } else if (typeof answerData.answerIds === 'number') {
          selectedAnswerIds = [answerData.answerIds];
        } else if (typeof answerData.answerIds === 'string') {
          const parsed = answerData.answerIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          selectedAnswerIds = parsed.length > 0 ? parsed : null;
        }
      }

      // Only include answerData if it's provided and not empty or just "{}"
      const finalAnswerData = answerData.answerData && answerData.answerData.trim() !== '' && answerData.answerData !== '{}' 
        ? answerData.answerData 
        : null;

      // Build request body according to SaveAnswerRequest DTO
      const requestBody = {
        questionId: numericQuestionId,
        selectedAnswerIds: selectedAnswerIds && selectedAnswerIds.length > 0 ? selectedAnswerIds : null,
        textAnswer: answerData.textAnswer || null,
        answerData: finalAnswerData
      };

      console.log(`[submitAnswer] Saving answer for exam ${examId}, attempt ${attemptId}, question ${numericQuestionId}:`, {
        ...requestBody,
        selectedAnswerIds: requestBody.selectedAnswerIds,
        selectedAnswerIdsType: Array.isArray(requestBody.selectedAnswerIds) ? 'array' : typeof requestBody.selectedAnswerIds,
        selectedAnswerIdsLength: Array.isArray(requestBody.selectedAnswerIds) ? requestBody.selectedAnswerIds.length : 'N/A'
      });

      const response = await api.post(
        `/api/exams/${examId}/attempts/${attemptId}/answer`,
        requestBody
      );
      
      // Backend returns SaveAnswerResult: { Success, ErrorCode?, Message? }
      const result = response.data;
      if (result && result.success !== undefined) {
        // Handle SaveAnswerResult format
        if (result.success) {
          return {
            success: true,
            data: result,
            message: result.message || 'Lưu câu trả lời thành công'
          };
        } else {
          return {
            success: false,
            error: result,
            errorCode: result.errorCode,
            message: result.message || 'Không thể lưu câu trả lời'
          };
        }
      }
      
      return {
        success: true,
        data: result,
        message: 'Lưu câu trả lời thành công'
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Provide more detailed error message
      let errorMessage = 'Không thể lưu câu trả lời';
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.Message) {
          errorMessage = errorData.Message;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.Error) {
          errorMessage = errorData.Error;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = 'Yêu cầu không hợp lệ. Có thể attempt đã được submit hoặc không tồn tại.';
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy attempt hoặc exam';
      } else if (error.response?.status === 401) {
        errorMessage = 'Không có quyền truy cập';
      }
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Submit the entire exam attempt
   * POST /api/exams/{examId}/attempts/{attemptId}/submit
   */
  async submitAttempt(examId, attemptId) {
    try {
      const response = await api.post(`/api/exams/${examId}/attempts/${attemptId}/submit`);
      return {
        success: true,
        data: response.data,
        message: 'Nộp bài thi thành công'
      };
    } catch (error) {
      console.error('Error submitting exam attempt:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể nộp bài thi'
      };
    }
  },

  /**
   * Get the latest attempt for current user
   * GET /api/exams/{examId}/attempts/my-latest
   */
  async getLatestAttempt(examId) {
    try {
      const response = await api.get(`/api/exams/${examId}/attempts/my-latest`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin lần làm bài mới nhất thành công'
      };
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy thông tin lần làm bài'
      };
    }
  },

  /**
   * Get a specific exam attempt
   * GET /api/exams/{examId}/attempts/{attemptId}
   */
  async getAttemptById(examId, attemptId) {
    try {
      const response = await api.get(`/api/exams/${examId}/attempts/${attemptId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin lần làm bài thành công'
      };
    } catch (error) {
      console.error('Error fetching exam attempt:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy thông tin lần làm bài'
      };
    }
  },

  /**
   * Get all attempts for an exam
   * GET /api/exams/{examId}/attempts
   */
  async getAllAttempts(examId) {
    try {
      const response = await api.get(`/api/exams/${examId}/attempts`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách lần làm bài thành công'
      };
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy danh sách lần làm bài'
      };
    }
  },

  /**
   * Get current student's attempt count for a specific exam
   * Uses GET /api/exams/{examId}/attempts and filters by current student ID
   * @param {number} examId - The exam ID
   * @returns {Promise<{success: boolean, count?: number, attempts?: Array, message?: string}>}
   */
  async getMyAttemptCount(examId) {
    try {
      // Get all attempts for this exam using getExamAttempts method
      const response = await this.getExamAttempts(examId);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          count: 0,
          attempts: [],
          message: response.message || 'Không thể lấy thông tin attempts'
        };
      }

      // Get current student ID from token
      let currentStudentId = null;
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          currentStudentId = decoded.userId || decoded.sub || 
                           decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                           decoded.id;
          if (currentStudentId) {
            currentStudentId = parseInt(currentStudentId);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      if (!currentStudentId) {
        return {
          success: false,
          count: 0,
          attempts: [],
          message: 'Không thể xác định học sinh hiện tại'
        };
      }

      // Filter attempts by current student ID
      // Status: 0 = InProgress, 1 = Submitted, 2 = Graded, 3 = Expired
      const attempts = Array.isArray(response.data) ? response.data : [];
      
      console.log(`[getMyAttemptCount] Exam ${examId}: Found ${attempts.length} total attempts`);
      console.log(`[getMyAttemptCount] Current student ID: ${currentStudentId} (type: ${typeof currentStudentId})`);
      console.log(`[getMyAttemptCount] All attempts:`, attempts.map(a => ({
        Id: a.Id || a.id,
        StudentId: a.StudentId || a.studentId,
        Status: a.Status !== undefined ? a.Status : a.status,
        SubmittedAt: a.SubmittedAt || a.submittedAt,
        AttemptNumber: a.AttemptNumber || a.attemptNumber
      })));
      
      // Filter attempts by current student ID
      const myAttempts = attempts.filter(attempt => {
        const studentId = attempt.StudentId !== undefined ? attempt.StudentId : attempt.studentId;
        const studentIdNum = typeof studentId === 'string' ? parseInt(studentId) : studentId;
        const currentIdNum = typeof currentStudentId === 'string' ? parseInt(currentStudentId) : currentStudentId;
        
        // Compare as numbers
        return studentIdNum === currentIdNum;
      });
      
      // Count total attempts (all statuses)
      const totalAttempts = myAttempts.length;
      
      // Count submitted attempts (status = 1 Submitted or 2 Graded)
      const submittedAttempts = myAttempts.filter(attempt => {
        const status = attempt.Status !== undefined ? attempt.Status : attempt.status;
        const submittedAt = attempt.SubmittedAt !== undefined ? attempt.SubmittedAt : attempt.submittedAt;
        
        // Count if status is Submitted (1) or Graded (2), or if SubmittedAt exists
        const isSubmitted = status === 1 || status === 2 || 
                           status === 'Submitted' || status === 'Graded' ||
                           (submittedAt !== null && submittedAt !== undefined);
        
        console.log(`[getMyAttemptCount] Attempt ${attempt.Id || attempt.id}: StudentId=${attempt.StudentId || attempt.studentId}, Status=${status}, SubmittedAt=${submittedAt}, isSubmitted=${isSubmitted}`);
        
        return isSubmitted;
      });

      console.log(`[getMyAttemptCount] Found ${totalAttempts} total attempts, ${submittedAttempts.length} submitted attempts for student ${currentStudentId}`);

      return {
        success: true,
        count: totalAttempts, // Total attempts (all statuses)
        submittedCount: submittedAttempts.length, // Only submitted attempts
        attempts: myAttempts, // All attempts
        submittedAttempts: submittedAttempts, // Only submitted attempts
        message: 'Lấy số lần làm bài thành công'
      };
    } catch (error) {
      console.error('Error getting my attempt count:', error);
      return {
        success: false,
        count: 0,
        attempts: [],
        message: error.message || 'Không thể lấy số lần làm bài'
      };
    }
  },
};

export default examAttemptService;

