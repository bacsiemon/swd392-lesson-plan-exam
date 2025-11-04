import api from './axios';

/**
 * Exam Matrix Service - Handles all API calls related to exam matrices
 * Based on ExamMatrixController.cs endpoints
 */
const examMatrixService = {
  /**
   * Create a new exam matrix
   * POST /api/exam-matrices
   * @param {object} examMatrixData - Exam matrix creation data (can be camelCase or PascalCase)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async createExamMatrix(examMatrixData) {
    try {
      // Map to backend expected format (camelCase)
      // Backend expects order: name, description, teacherId, totalQuestions, totalPoints, configuration
      const requestData = {
        name: examMatrixData.name || examMatrixData.Name || '',
        description: examMatrixData.description !== undefined ? (examMatrixData.description || null) : (examMatrixData.Description !== undefined ? (examMatrixData.Description || null) : null),
        teacherId: examMatrixData.teacherId !== undefined ? examMatrixData.teacherId : (examMatrixData.TeacherId !== undefined ? examMatrixData.TeacherId : 0),
        totalQuestions: examMatrixData.totalQuestions !== undefined && examMatrixData.totalQuestions !== null 
          ? examMatrixData.totalQuestions 
          : (examMatrixData.TotalQuestions !== undefined && examMatrixData.TotalQuestions !== null ? examMatrixData.TotalQuestions : null),
        totalPoints: examMatrixData.totalPoints !== undefined && examMatrixData.totalPoints !== null
          ? examMatrixData.totalPoints
          : (examMatrixData.TotalPoints !== undefined && examMatrixData.TotalPoints !== null ? examMatrixData.TotalPoints : null),
        configuration: (examMatrixData.configuration === null || examMatrixData.configuration === undefined || examMatrixData.configuration === '' || examMatrixData.configuration === 'null' || examMatrixData.Configuration === 'null')
          ? null
          : (examMatrixData.configuration || examMatrixData.Configuration || null)
      };

      const response = await api.post('/api/exam-matrices', requestData);

      if (response.status === 201 || response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Tạo ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Tạo ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error creating exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Tạo ma trận đề thất bại. Vui lòng thử lại.';
      
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
   * Get all exam matrices
   * GET /api/exam-matrices?teacherId={teacherId}&q={searchTerm}
   * @param {object} filters - Optional filters: { teacherId?: number, q?: string }
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getAllExamMatrices(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.teacherId !== undefined && filters.teacherId !== null) {
        params.append('teacherId', filters.teacherId.toString());
      }
      if (filters.q !== undefined && filters.q !== null && filters.q.trim() !== '') {
        params.append('q', filters.q.trim());
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/exam-matrices?${queryString}` : '/api/exam-matrices';
      const response = await api.get(url);

      if (response.status === 200) {
        // Backend returns IEnumerable<ExamMatrixResponse> directly as array
        // response.data should be an array of ExamMatrixResponse objects
        console.log('getAllExamMatrices response:', response.data);
        return {
          success: true,
          data: response.data, // Should be array directly
          message: 'Lấy danh sách ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy danh sách ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error getting exam matrices:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Lấy danh sách ma trận đề thất bại. Vui lòng thử lại.';
      
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
   * Get exam matrix by ID
   * GET /api/exam-matrices/{id}
   * @param {number|string} id - Exam matrix ID
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getExamMatrixById(id) {
    try {
      const response = await api.get(`/api/exam-matrices/${id}`);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Lấy thông tin ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy thông tin ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error getting exam matrix by ID:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Lấy thông tin ma trận đề thất bại. Vui lòng thử lại.';
      
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
   * Update exam matrix by ID
   * PUT /api/exam-matrices/{id}
   * @param {number|string} id - Exam matrix ID
   * @param {object} examMatrixData - Exam matrix update data (can be camelCase or PascalCase)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async updateExamMatrix(id, examMatrixData) {
    try {
      // Map to backend expected format (camelCase)
      // Backend expects: name, description, totalQuestions, totalPoints, configuration (no teacherId)
      const requestData = {
        name: examMatrixData.name || examMatrixData.Name || '',
        description: examMatrixData.description !== undefined ? (examMatrixData.description || null) : (examMatrixData.Description !== undefined ? (examMatrixData.Description || null) : null),
        totalQuestions: examMatrixData.totalQuestions !== undefined && examMatrixData.totalQuestions !== null 
          ? examMatrixData.totalQuestions 
          : (examMatrixData.TotalQuestions !== undefined && examMatrixData.TotalQuestions !== null ? examMatrixData.TotalQuestions : null),
        totalPoints: examMatrixData.totalPoints !== undefined && examMatrixData.totalPoints !== null
          ? examMatrixData.totalPoints
          : (examMatrixData.TotalPoints !== undefined && examMatrixData.TotalPoints !== null ? examMatrixData.TotalPoints : null),
        configuration: (examMatrixData.configuration === null || examMatrixData.configuration === undefined || examMatrixData.configuration === '' || examMatrixData.configuration === 'null' || examMatrixData.Configuration === 'null')
          ? null
          : (examMatrixData.configuration || examMatrixData.Configuration || null)
      };

      const response = await api.put(`/api/exam-matrices/${id}`, requestData);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật ma trận đề thất bại. Vui lòng thử lại.';
      
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
   * Delete exam matrix by ID
   * DELETE /api/exam-matrices/{id}
   * @param {number|string} id - Exam matrix ID
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteExamMatrix(id) {
    try {
      const response = await api.delete(`/api/exam-matrices/${id}`);

      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Xóa ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Xóa ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error deleting exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Xóa ma trận đề thất bại. Vui lòng thử lại.';
      
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
   * Add item to exam matrix
   * POST /api/exam-matrices/{id}/items
   * @param {number|string} id - Exam matrix ID
   * @param {object} itemData - Item data to add (can be camelCase or PascalCase)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async addItemToExamMatrix(id, itemData) {
    try {
      // Map to backend expected format (PascalCase)
      // Backend expects: QuestionBankId, Domain, DifficultyLevel, QuestionCount, PointsPerQuestion
      const requestData = {
        QuestionBankId: itemData.QuestionBankId !== undefined ? itemData.QuestionBankId : (itemData.questionBankId !== undefined ? itemData.questionBankId : null),
        Domain: itemData.Domain || itemData.domain || null,
        DifficultyLevel: itemData.DifficultyLevel !== undefined && itemData.DifficultyLevel !== null
          ? itemData.DifficultyLevel
          : (itemData.difficultyLevel !== undefined && itemData.difficultyLevel !== null ? itemData.difficultyLevel : null),
        QuestionCount: itemData.QuestionCount !== undefined ? itemData.QuestionCount : (itemData.questionCount !== undefined ? itemData.questionCount : 0),
        PointsPerQuestion: itemData.PointsPerQuestion !== undefined && itemData.PointsPerQuestion !== null
          ? itemData.PointsPerQuestion
          : (itemData.pointsPerQuestion !== undefined && itemData.pointsPerQuestion !== null ? itemData.pointsPerQuestion : null)
      };

      const response = await api.post(`/api/exam-matrices/${id}/items`, requestData);

      if (response.status === 201 || response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Thêm item vào ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Thêm item vào ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error adding item to exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Thêm item vào ma trận đề thất bại. Vui lòng thử lại.';
      
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
   * Get items for exam matrix
   * GET /api/exam-matrices/{id}/items
   * @param {number|string} id - Exam matrix ID
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getItemsForExamMatrix(id) {
    try {
      const response = await api.get(`/api/exam-matrices/${id}/items`);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Lấy danh sách items thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy danh sách items thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error getting items for exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Lấy danh sách items thất bại. Vui lòng thử lại.';
      
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
   * Update item in exam matrix
   * PUT /api/exam-matrices/{id}/items/{itemId}
   * @param {number|string} id - Exam matrix ID
   * @param {number|string} itemId - Item ID
   * @param {object} itemData - Item update data (can be camelCase or PascalCase)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async updateItemInExamMatrix(id, itemId, itemData) {
    try {
      // Map to backend expected format (PascalCase)
      // Backend expects: QuestionBankId, Domain, DifficultyLevel, QuestionCount, PointsPerQuestion
      const requestData = {
        QuestionBankId: itemData.QuestionBankId !== undefined ? itemData.QuestionBankId : (itemData.questionBankId !== undefined ? itemData.questionBankId : null),
        Domain: itemData.Domain || itemData.domain || null,
        DifficultyLevel: itemData.DifficultyLevel !== undefined && itemData.DifficultyLevel !== null
          ? itemData.DifficultyLevel
          : (itemData.difficultyLevel !== undefined && itemData.difficultyLevel !== null ? itemData.difficultyLevel : null),
        QuestionCount: itemData.QuestionCount !== undefined ? itemData.QuestionCount : (itemData.questionCount !== undefined ? itemData.questionCount : 0),
        PointsPerQuestion: itemData.PointsPerQuestion !== undefined && itemData.PointsPerQuestion !== null
          ? itemData.PointsPerQuestion
          : (itemData.pointsPerQuestion !== undefined && itemData.pointsPerQuestion !== null ? itemData.pointsPerQuestion : null)
      };

      const response = await api.put(`/api/exam-matrices/${id}/items/${itemId}`, requestData);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật item thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật item thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating item in exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật item thất bại. Vui lòng thử lại.';
      
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
   * Delete item from exam matrix
   * DELETE /api/exam-matrices/{id}/items/{itemId}
   * @param {number|string} id - Exam matrix ID
   * @param {number|string} itemId - Item ID
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteItemFromExamMatrix(id, itemId) {
    try {
      const response = await api.delete(`/api/exam-matrices/${id}/items/${itemId}`);

      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Xóa item thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Xóa item thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error deleting item from exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Xóa item thất bại. Vui lòng thử lại.';
      
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
   * Validate exam matrix
   * POST /api/exam-matrices/{id}/validate
   * @param {number|string} id - Exam matrix ID
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async validateExamMatrix(id) {
    try {
      const response = await api.post(`/api/exam-matrices/${id}/validate`);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Kiểm tra ma trận đề thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Kiểm tra ma trận đề thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error validating exam matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Kiểm tra ma trận đề thất bại. Vui lòng thử lại.';
      
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

export default examMatrixService;

