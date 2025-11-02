import api from './axios';

const examAttemptService = {
  /**
   * Start a new exam attempt
   * POST /api/exams/{examId}/attempts/start
   */
  async startAttempt(examId) {
    try {
      const response = await api.post(`/api/exams/${examId}/attempts/start`);
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
   */
  async submitAnswer(examId, attemptId, answerData) {
    try {
      const response = await api.post(`/api/exams/${examId}/attempts/${attemptId}/answer`, answerData);
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

