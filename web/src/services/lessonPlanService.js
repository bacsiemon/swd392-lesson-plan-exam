import api from './axios';

const lessonPlanService = {
  /**
   * Create a new lesson plan
   * POST /api/LessonPlan
   */
  async createLessonPlan(data) {
    try {
      const response = await api.post('/api/LessonPlan', data);
      return {
        success: true,
        data: response.data,
        message: 'Tạo giáo án thành công'
      };
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể tạo giáo án'
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
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách giáo án thành công'
      };
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể tải danh sách giáo án'
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
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin giáo án thành công'
      };
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể tải thông tin giáo án'
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

      const response = await api.post(`/api/LessonPlan/${lessonPlanId}/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Tải lên file thành công'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Không thể tải lên file'
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

