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
   * Submit an answer for a question
   * POST /api/exams/{examId}/attempts/{attemptId}/answer
   * @param {number} examId - The exam ID
   * @param {number} attemptId - The attempt ID
   * @param {Object} answerData - Answer data
   * @param {number} answerData.questionId - Question ID
   * @param {string|number|number[]} [answerData.answerIds] - Answer ID(s) - will be converted to comma-separated string
   * @param {string} [answerData.selectedAnswerIds] - Comma-separated answer IDs (e.g., "10,11") - if already formatted
   * @param {string} [answerData.textAnswer] - Text answer for fill-in-the-blank
   */
  async submitAnswer(examId, attemptId, answerData) {
    try {
      // Format answer IDs according to backend SaveAnswerRequest
      let selectedAnswerIds = null;
      
      if (answerData.selectedAnswerIds) {
        // Already formatted
        selectedAnswerIds = answerData.selectedAnswerIds;
      } else if (answerData.answerIds != null) {
        // Format using helper
        selectedAnswerIds = formatAnswerIds(answerData.answerIds);
      }

      const requestBody = {
        questionId: answerData.questionId,
        selectedAnswerIds: selectedAnswerIds,
        textAnswer: answerData.textAnswer || null
      };

      const response = await api.post(
        `/api/exams/${examId}/attempts/${attemptId}/answer`,
        requestBody
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Lưu câu trả lời thành công'
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lưu câu trả lời'
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
};

export default examAttemptService;

