import api from './axios';

const examService = {
  /**
   * Get exam details by ID
   * GET /api/exams/{id}
   */
  async getExamById(examId) {
    try {
      const response = await api.get(`/api/exams/${examId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin bài thi thành công'
      };
    } catch (error) {
      console.error('Error fetching exam:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể lấy thông tin bài thi'
      };
    }
  },
};

export default examService;

