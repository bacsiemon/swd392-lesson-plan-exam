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
      const params = password ? { password } : {};
      const response = await api.post(`/api/exams/${examId}/attempts/start`, null, { params });
      return {
        success: true,
        data: response.data,
        message: 'Bắt đầu bài thi thành công'
      };
    } catch (error) {
      console.error('Error starting exam attempt:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể bắt đầu bài thi'
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

