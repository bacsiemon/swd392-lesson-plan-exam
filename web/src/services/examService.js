import api from './axios';

/**
 * Exam Service - Handles all API calls related to exams
 * Based on ExamController.cs endpoints
 */
const examService = {
  /**
   * Create a new exam manually
   * POST /api/exams
   * @param {object} examData - Exam creation data
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async createExam(examData) {
    try {
      // Map to backend expected format (camelCase)
      // Backend expects: title, description, createdByTeacher, gradeLevel, durationMinutes, etc.
      const requestData = {
        title: examData.title || examData.Title || '',
        description: examData.description !== undefined ? (examData.description || null) : (examData.Description !== undefined ? (examData.Description || null) : null),
        createdByTeacher: examData.createdByTeacher !== undefined ? examData.createdByTeacher : (examData.CreatedByTeacher !== undefined ? examData.CreatedByTeacher : null),
        gradeLevel: examData.gradeLevel !== undefined && examData.gradeLevel !== null 
          ? examData.gradeLevel 
          : (examData.GradeLevel !== undefined && examData.GradeLevel !== null ? examData.GradeLevel : null),
        durationMinutes: examData.durationMinutes !== undefined && examData.durationMinutes !== null
          ? examData.durationMinutes
          : (examData.DurationMinutes !== undefined && examData.DurationMinutes !== null ? examData.DurationMinutes : null),
        passThreshold: examData.passThreshold !== undefined && examData.passThreshold !== null
          ? examData.passThreshold
          : (examData.PassThreshold !== undefined && examData.PassThreshold !== null ? examData.PassThreshold : null),
        showResultsImmediately: examData.showResultsImmediately !== undefined 
          ? examData.showResultsImmediately 
          : (examData.ShowResultsImmediately !== undefined ? examData.ShowResultsImmediately : null),
        showCorrectAnswers: examData.showCorrectAnswers !== undefined
          ? examData.showCorrectAnswers
          : (examData.ShowCorrectAnswers !== undefined ? examData.ShowCorrectAnswers : null),
        randomizeQuestions: examData.randomizeQuestions !== undefined
          ? examData.randomizeQuestions
          : (examData.RandomizeQuestions !== undefined ? examData.RandomizeQuestions : null),
        randomizeAnswers: examData.randomizeAnswers !== undefined
          ? examData.randomizeAnswers
          : (examData.RandomizeAnswers !== undefined ? examData.RandomizeAnswers : null),
        maxAttempts: examData.maxAttempts !== undefined && examData.maxAttempts !== null
          ? examData.maxAttempts
          : (examData.MaxAttempts !== undefined && examData.MaxAttempts !== null ? examData.MaxAttempts : null),
        scoringMethodEnum: examData.scoringMethodEnum !== undefined && examData.scoringMethodEnum !== null
          ? examData.scoringMethodEnum
          : (examData.ScoringMethodEnum !== undefined && examData.ScoringMethodEnum !== null ? examData.ScoringMethodEnum : null),
        startTime: examData.startTime !== undefined && examData.startTime !== null
          ? examData.startTime
          : (examData.StartTime !== undefined && examData.StartTime !== null ? examData.StartTime : null),
        endTime: examData.endTime !== undefined && examData.endTime !== null
          ? examData.endTime
          : (examData.EndTime !== undefined && examData.EndTime !== null ? examData.EndTime : null),
        password: examData.password !== undefined 
          ? (examData.password !== null ? examData.password : null)
          : (examData.Password !== undefined ? (examData.Password !== null ? examData.Password : null) : null),
        totalPoints: examData.totalPoints !== undefined && examData.totalPoints !== null
          ? examData.totalPoints
          : (examData.TotalPoints !== undefined && examData.TotalPoints !== null ? examData.TotalPoints : null),
        totalQuestions: examData.totalQuestions !== undefined && examData.totalQuestions !== null
          ? examData.totalQuestions
          : (examData.TotalQuestions !== undefined && examData.TotalQuestions !== null ? examData.TotalQuestions : null),
        examMatrixId: examData.examMatrixId !== undefined && examData.examMatrixId !== null
          ? examData.examMatrixId
          : (examData.ExamMatrixId !== undefined && examData.ExamMatrixId !== null ? examData.ExamMatrixId : null),
        statusEnum: examData.statusEnum !== undefined && examData.statusEnum !== null
          ? examData.statusEnum
          : (examData.StatusEnum !== undefined && examData.StatusEnum !== null ? examData.StatusEnum : null)
      };

      console.log('Creating exam with data:', JSON.stringify(requestData, null, 2));

      const response = await api.post('/api/exams', requestData);

      // Backend returns ExamResponse directly (status 201)
      if (response.status === 201) {
        return {
          success: true,
          data: response.data,
          message: 'Tạo bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Tạo bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      let errorMessage = 'Tạo bài thi thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Validation errors
          const errorMessages = Object.values(errorData.errors).flat();
          errorMessage = errorMessages.join(', ');
        }
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
   * Create an exam from an existing exam matrix
   * POST /api/exams/from-matrix
   * @param {object} examData - Exam from matrix creation data
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async createExamFromMatrix(examData) {
    try {
      // Map to backend expected format (camelCase)
      // Backend expects: examMatrixId (Required), title, description, createdByTeacher, etc.
      const requestData = {
        examMatrixId: examData.examMatrixId !== undefined ? examData.examMatrixId : (examData.ExamMatrixId !== undefined ? examData.ExamMatrixId : null),
        title: examData.title !== undefined ? (examData.title || null) : (examData.Title !== undefined ? (examData.Title || null) : null),
        description: examData.description !== undefined ? (examData.description || null) : (examData.Description !== undefined ? (examData.Description || null) : null),
        createdByTeacher: examData.createdByTeacher !== undefined ? examData.createdByTeacher : (examData.CreatedByTeacher !== undefined ? examData.CreatedByTeacher : null),
        gradeLevel: examData.gradeLevel !== undefined && examData.gradeLevel !== null
          ? examData.gradeLevel
          : (examData.GradeLevel !== undefined && examData.GradeLevel !== null ? examData.GradeLevel : null),
        durationMinutes: examData.durationMinutes !== undefined && examData.durationMinutes !== null
          ? examData.durationMinutes
          : (examData.DurationMinutes !== undefined && examData.DurationMinutes !== null ? examData.DurationMinutes : null),
        totalPoints: examData.totalPoints !== undefined && examData.totalPoints !== null
          ? examData.totalPoints
          : (examData.TotalPoints !== undefined && examData.TotalPoints !== null ? examData.TotalPoints : null),
        passThreshold: examData.passThreshold !== undefined && examData.passThreshold !== null
          ? examData.passThreshold
          : (examData.PassThreshold !== undefined && examData.PassThreshold !== null ? examData.PassThreshold : null),
        showResultsImmediately: examData.showResultsImmediately !== undefined
          ? examData.showResultsImmediately
          : (examData.ShowResultsImmediately !== undefined ? examData.ShowResultsImmediately : null),
        showCorrectAnswers: examData.showCorrectAnswers !== undefined
          ? examData.showCorrectAnswers
          : (examData.ShowCorrectAnswers !== undefined ? examData.ShowCorrectAnswers : null),
        randomizeQuestions: examData.randomizeQuestions !== undefined
          ? examData.randomizeQuestions
          : (examData.RandomizeQuestions !== undefined ? examData.RandomizeQuestions : null),
        randomizeAnswers: examData.randomizeAnswers !== undefined
          ? examData.randomizeAnswers
          : (examData.RandomizeAnswers !== undefined ? examData.RandomizeAnswers : null),
        maxAttempts: examData.maxAttempts !== undefined && examData.maxAttempts !== null
          ? examData.maxAttempts
          : (examData.MaxAttempts !== undefined && examData.MaxAttempts !== null ? examData.MaxAttempts : null),
        scoringMethodEnum: examData.scoringMethodEnum !== undefined && examData.scoringMethodEnum !== null
          ? examData.scoringMethodEnum
          : (examData.ScoringMethodEnum !== undefined && examData.ScoringMethodEnum !== null ? examData.ScoringMethodEnum : null),
        startTime: examData.startTime !== undefined && examData.startTime !== null
          ? examData.startTime
          : (examData.StartTime !== undefined && examData.StartTime !== null ? examData.StartTime : null),
        endTime: examData.endTime !== undefined && examData.endTime !== null
          ? examData.endTime
          : (examData.EndTime !== undefined && examData.EndTime !== null ? examData.EndTime : null),
        password: examData.password !== undefined && examData.password !== null
          ? examData.password
          : (examData.Password !== undefined && examData.Password !== null ? examData.Password : null)
      };

      console.log('Creating exam from matrix with data:', JSON.stringify(requestData, null, 2));

      const response = await api.post('/api/exams/from-matrix', requestData);

      if (response.status === 201) {
        return {
          success: true,
          data: response.data,
          message: 'Tạo bài thi từ ma trận thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Tạo bài thi từ ma trận thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error creating exam from matrix:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Tạo bài thi từ ma trận thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (errorData.Message === 'MATRIX_NOT_FOUND_OR_INVALID') {
          errorMessage = 'Không tìm thấy ma trận đề hoặc ma trận không hợp lệ';
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
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
   * Get a list of exams with optional filters
   * GET /api/exams?teacherId={teacherId}&status={status}&q={q}
   * @param {object} params - Query parameters
   * @param {number} params.teacherId - Filter by teacher ID (optional)
   * @param {number} params.status - Filter by exam status (optional: 0=Draft, 1=Inactive, 2=Active)
   * @param {string} params.q - Search term in title or description (optional)
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getExams(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.teacherId !== undefined && params.teacherId !== null) {
        queryParams.append('teacherId', params.teacherId);
      }
      if (params.status !== undefined && params.status !== null) {
        queryParams.append('status', params.status);
      }
      if (params.q) {
        queryParams.append('q', params.q);
      }

      const url = `/api/exams${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);

      // Backend returns IEnumerable<ExamResponse>
      if (response.status === 200) {
        return {
          success: true,
          data: Array.isArray(response.data) ? response.data : [],
          message: 'Lấy danh sách bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy danh sách bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể tải danh sách bài thi';
      
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Get exam details by ID
   * GET /api/exams/{id}
   * @param {number} id - Exam ID
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getExamById(id) {
    try {
      const response = await api.get(`/api/exams/${id}`);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Lấy thông tin bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy thông tin bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể lấy thông tin bài thi';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy bài thi';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Update an existing exam
   * PUT /api/exams/{id}
   * @param {number} id - Exam ID
   * @param {object} examData - Updated exam data (same format as createExam)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async updateExam(id, examData) {
    try {
      // Map to backend expected format (camelCase)
      // ExamUpdateRequest extends ExamCreateRequest, so same fields
      const requestData = {
        title: examData.title || examData.Title || '',
        description: examData.description !== undefined ? (examData.description || null) : (examData.Description !== undefined ? (examData.Description || null) : null),
        createdByTeacher: examData.createdByTeacher !== undefined ? examData.createdByTeacher : (examData.CreatedByTeacher !== undefined ? examData.CreatedByTeacher : null),
        gradeLevel: examData.gradeLevel !== undefined && examData.gradeLevel !== null
          ? examData.gradeLevel
          : (examData.GradeLevel !== undefined && examData.GradeLevel !== null ? examData.GradeLevel : null),
        durationMinutes: examData.durationMinutes !== undefined && examData.durationMinutes !== null
          ? examData.durationMinutes
          : (examData.DurationMinutes !== undefined && examData.DurationMinutes !== null ? examData.DurationMinutes : null),
        passThreshold: examData.passThreshold !== undefined && examData.passThreshold !== null
          ? examData.passThreshold
          : (examData.PassThreshold !== undefined && examData.PassThreshold !== null ? examData.PassThreshold : null),
        showResultsImmediately: examData.showResultsImmediately !== undefined
          ? examData.showResultsImmediately
          : (examData.ShowResultsImmediately !== undefined ? examData.ShowResultsImmediately : null),
        showCorrectAnswers: examData.showCorrectAnswers !== undefined
          ? examData.showCorrectAnswers
          : (examData.ShowCorrectAnswers !== undefined ? examData.ShowCorrectAnswers : null),
        randomizeQuestions: examData.randomizeQuestions !== undefined
          ? examData.randomizeQuestions
          : (examData.RandomizeQuestions !== undefined ? examData.RandomizeQuestions : null),
        randomizeAnswers: examData.randomizeAnswers !== undefined
          ? examData.randomizeAnswers
          : (examData.RandomizeAnswers !== undefined ? examData.RandomizeAnswers : null),
        maxAttempts: examData.maxAttempts !== undefined && examData.maxAttempts !== null
          ? examData.maxAttempts
          : (examData.MaxAttempts !== undefined && examData.MaxAttempts !== null ? examData.MaxAttempts : null),
        scoringMethodEnum: examData.scoringMethodEnum !== undefined && examData.scoringMethodEnum !== null
          ? examData.scoringMethodEnum
          : (examData.ScoringMethodEnum !== undefined && examData.ScoringMethodEnum !== null ? examData.ScoringMethodEnum : null),
        startTime: examData.startTime !== undefined && examData.startTime !== null
          ? examData.startTime
          : (examData.StartTime !== undefined && examData.StartTime !== null ? examData.StartTime : null),
        endTime: examData.endTime !== undefined && examData.endTime !== null
          ? examData.endTime
          : (examData.EndTime !== undefined && examData.EndTime !== null ? examData.EndTime : null),
        password: examData.password !== undefined 
          ? (examData.password !== null ? examData.password : null)
          : (examData.Password !== undefined ? (examData.Password !== null ? examData.Password : null) : null),
        totalPoints: examData.totalPoints !== undefined && examData.totalPoints !== null
          ? examData.totalPoints
          : (examData.TotalPoints !== undefined && examData.TotalPoints !== null ? examData.TotalPoints : null),
        totalQuestions: examData.totalQuestions !== undefined && examData.totalQuestions !== null
          ? examData.totalQuestions
          : (examData.TotalQuestions !== undefined && examData.TotalQuestions !== null ? examData.TotalQuestions : null),
        examMatrixId: examData.examMatrixId !== undefined && examData.examMatrixId !== null
          ? examData.examMatrixId
          : (examData.ExamMatrixId !== undefined && examData.ExamMatrixId !== null ? examData.ExamMatrixId : null)
      };

      console.log('Updating exam with data:', JSON.stringify(requestData, null, 2));

      const response = await api.put(`/api/exams/${id}`, requestData);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật bài thi thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy bài thi';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Update exam status
   * PATCH /api/exams/{id}/status
   * @param {number} id - Exam ID
   * @param {number} statusEnum - Status: 0=Draft, 1=Inactive, 2=Active
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async updateExamStatus(id, statusEnum) {
    try {
      // Map to backend expected format (camelCase)
      // Backend expects: { statusEnum: number }
      const requestData = {
        statusEnum: statusEnum
      };

      const response = await api.patch(`/api/exams/${id}/status`, requestData);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật trạng thái bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật trạng thái bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating exam status:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật trạng thái bài thi thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy bài thi';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Add a question to an exam
   * POST /api/exams/{id}/questions
   * @param {number} examId - Exam ID
   * @param {object} questionData - Question add request: { questionId, points?, orderIndex? }
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async addQuestionToExam(examId, questionData) {
    try {
      // Map to backend expected format (PascalCase to match C# DTO)
      // Backend DTO: ExamQuestionAddRequest { QuestionId (Required), Points?, OrderIndex? }
      // Use PascalCase to match C# property names exactly
      const questionIdValue = questionData.questionId !== undefined ? questionData.questionId : (questionData.QuestionId !== undefined ? questionData.QuestionId : null);
      
      if (!questionIdValue) {
        throw new Error('questionId is required');
      }
      
      const requestData = {
        QuestionId: questionIdValue,
        Points: questionData.points !== undefined && questionData.points !== null
          ? questionData.points
          : (questionData.Points !== undefined && questionData.Points !== null ? questionData.Points : null),
        OrderIndex: questionData.orderIndex !== undefined && questionData.orderIndex !== null
          ? questionData.orderIndex
          : (questionData.OrderIndex !== undefined && questionData.OrderIndex !== null ? questionData.OrderIndex : null)
      };

      const response = await api.post(`/api/exams/${examId}/questions`, requestData);

      if (response.status === 201) {
        return {
          success: true,
          data: response.data,
          message: 'Thêm câu hỏi vào bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Thêm câu hỏi vào bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error adding question to exam:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Thêm câu hỏi vào bài thi thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        if (errorData.Message === 'INVALID_EXAM_OR_QUESTION') {
          errorMessage = 'Bài thi hoặc câu hỏi không hợp lệ';
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
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
   * Get all questions in an exam
   * GET /api/exams/{id}/questions
   * @param {number} examId - Exam ID
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getExamQuestions(examId) {
    try {
      const response = await api.get(`/api/exams/${examId}/questions`);

      if (response.status === 200) {
        return {
          success: true,
          data: Array.isArray(response.data) ? response.data : [],
          message: 'Lấy danh sách câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy danh sách câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể tải danh sách câu hỏi';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy bài thi';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Update an exam question
   * PUT /api/exams/{id}/questions/{examQuestionId}
   * @param {number} examId - Exam ID (required in route but backend only uses examQuestionId)
   * @param {number} examQuestionId - Exam question ID
   * @param {object} questionData - Update request: { questionId, points?, orderIndex? }
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async updateExamQuestion(examId, examQuestionId, questionData) {
    try {
      // Map to backend expected format (camelCase)
      // Backend expects: { questionId (Required), points?, orderIndex? }
      const requestData = {
        questionId: questionData.questionId !== undefined ? questionData.questionId : (questionData.QuestionId !== undefined ? questionData.QuestionId : null),
        points: questionData.points !== undefined && questionData.points !== null
          ? questionData.points
          : (questionData.Points !== undefined && questionData.Points !== null ? questionData.Points : null),
        orderIndex: questionData.orderIndex !== undefined && questionData.orderIndex !== null
          ? questionData.orderIndex
          : (questionData.OrderIndex !== undefined && questionData.OrderIndex !== null ? questionData.OrderIndex : null)
      };

      // Backend route: PUT /api/exams/{id}/questions/{examQuestionId}
      // Route requires both {id} and {examQuestionId}, but controller only uses examQuestionId parameter
      // We'll use examId for {id} and examQuestionId for {examQuestionId}
      const response = await api.put(`/api/exams/${examId}/questions/${examQuestionId}`, requestData);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating exam question:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật câu hỏi thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy câu hỏi';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Delete an exam question
   * DELETE /api/exams/{id}/questions/{examQuestionId}
   * @param {number} examId - Exam ID (required in route but backend only uses examQuestionId)
   * @param {number} examQuestionId - Exam question ID
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteExamQuestion(examId, examQuestionId) {
    try {
      // Backend route: DELETE /api/exams/{id}/questions/{examQuestionId}
      // Route requires both {id} and {examQuestionId}, but controller only uses examQuestionId parameter
      // We'll use examId for {id} and examQuestionId for {examQuestionId}
      const response = await api.delete(`/api/exams/${examId}/questions/${examQuestionId}`);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Xóa câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Xóa câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error deleting exam question:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Xóa câu hỏi thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy câu hỏi';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Preview random questions from an exam matrix
   * POST /api/exams/{id}/preview-random?totalPoints={totalPoints}
   * @param {number} matrixId - Exam matrix ID
   * @param {number} totalPoints - Optional total points for distribution
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async previewRandomExam(matrixId, totalPoints = null) {
    try {
      const url = totalPoints !== null 
        ? `/api/exams/${matrixId}/preview-random?totalPoints=${totalPoints}`
        : `/api/exams/${matrixId}/preview-random`;
      
      const response = await api.post(url);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Preview bài thi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Preview bài thi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error previewing random exam:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Preview bài thi thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy ma trận đề';
      } else if (errorData) {
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  /**
   * Check access to an exam
   * GET /api/exams/{id}/access?studentId={studentId}&password={password}
   * @param {number} examId - Exam ID
   * @param {object} params - Access check parameters
   * @param {number} params.studentId - Optional student ID to check attempts
   * @param {string} params.password - Optional password to validate
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async checkExamAccess(examId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.studentId !== undefined && params.studentId !== null) {
        queryParams.append('studentId', params.studentId);
      }
      if (params.password) {
        queryParams.append('password', params.password);
      }

      const url = `/api/exams/${examId}/access${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Kiểm tra quyền truy cập thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Kiểm tra quyền truy cập thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error checking exam access:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Kiểm tra quyền truy cập thất bại. Vui lòng thử lại.';
      
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
        error: errorData || error.message,
        message: errorMessage,
        statusCode: error.response?.status
      };
    }
  }
};

export default examService;
