import api from './axios';

/**
 * Question Service - Handles all API calls related to questions
 * POST /api/questions - Create a new question
 * GET /api/questions - Get questions (with query params)
 * GET /api/questions/{id} - Get question by ID
 * PUT /api/questions/{id} - Update question
 * DELETE /api/questions/{id} - Delete question
 * PATCH /api/questions/{id}/active - Update question active status
 * POST /api/questions/bulk - Bulk create questions
 * GET /api/questions/{id}/preview - Preview question
 */
const questionService = {
  /**
   * Create a new question
   * POST /api/questions
   * @param {object} questionData - Question data
   * @param {number} questionData.questionBankId - Question bank ID (required)
   * @param {string} questionData.title - Question title (required)
   * @param {string} questionData.content - Question content (required)
   * @param {number} questionData.questionTypeEnum - Question type: 0 (MultipleChoice) or 1 (FillBlank) (required)
   * @param {number} questionData.questionDifficultyId - Difficulty ID (optional)
   * @param {string} questionData.additionalData - Additional data (optional)
   * @param {Array} questionData.multipleChoiceAnswers - For MultipleChoice type (required if questionTypeEnum === 0)
   * @param {Array} questionData.fillBlankAnswers - For FillBlank type (required if questionTypeEnum === 1)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async createQuestion(questionData) {
    try {
      // Backend sample uses camelCase format:
      // { questionBankId, title, content, questionTypeEnum, multipleChoiceAnswers/fillBlankAnswers }
      // ASP.NET Core can bind both camelCase and PascalCase, but let's use camelCase as per backend sample
      
      const questionTypeEnum = questionData.questionTypeEnum !== undefined 
        ? questionData.questionTypeEnum 
        : (questionData.QuestionTypeEnum !== undefined ? questionData.QuestionTypeEnum : 0);
      
      const requestData = {
        questionBankId: questionData.questionBankId || questionData.QuestionBankId,
        title: (questionData.title || questionData.Title || '').trim(),
        content: (questionData.content || questionData.Content || '').trim(),
        questionTypeEnum: questionTypeEnum,
        questionDifficultyId: questionData.questionDifficultyId !== undefined && questionData.questionDifficultyId !== null
          ? questionData.questionDifficultyId 
          : (questionData.QuestionDifficultyId !== undefined && questionData.QuestionDifficultyId !== null
              ? questionData.QuestionDifficultyId 
              : null),
        additionalData: questionData.additionalData || questionData.AdditionalData || null
      };

      // Validate required fields
      if (!requestData.questionBankId) {
        throw new Error('questionBankId is required');
      }
      if (!requestData.title || requestData.title.length === 0) {
        throw new Error('title is required');
      }
      if (!requestData.content || requestData.content.length === 0) {
        throw new Error('content is required');
      }

      // Handle MultipleChoice answers
      if (questionTypeEnum === 0) {
        if (!questionData.multipleChoiceAnswers || questionData.multipleChoiceAnswers.length === 0) {
          throw new Error('multipleChoiceAnswers is required for MultipleChoice question type');
        }
        
        requestData.multipleChoiceAnswers = questionData.multipleChoiceAnswers
          .filter(answer => answer && (answer.answerText || answer.text || answer.AnswerText)) // Filter empty answers
          .map((answer, index) => ({
            answerText: (answer.answerText || answer.text || answer.AnswerText || '').trim(),
            isCorrect: answer.isCorrect !== undefined ? answer.isCorrect : (answer.IsCorrect !== undefined ? answer.IsCorrect : false),
            explanation: answer.explanation || answer.Explanation || '', // Use empty string instead of null
            orderIndex: answer.orderIndex !== undefined ? answer.orderIndex : (answer.OrderIndex !== undefined ? answer.OrderIndex : index + 1)
          }));
        
        // Validate at least one answer exists
        if (requestData.multipleChoiceAnswers.length === 0) {
          throw new Error('At least one MultipleChoice answer is required');
        }
        
        // Set fillBlankAnswers to null for MultipleChoice (not undefined, so it's included in JSON as null)
        // This helps ASP.NET Core model binding - some validators expect the field to exist
        requestData.fillBlankAnswers = null;
      }

      // Handle FillBlank answers
      if (questionTypeEnum === 1) {
        if (!questionData.fillBlankAnswers || questionData.fillBlankAnswers.length === 0) {
          throw new Error('fillBlankAnswers is required for FillBlank question type');
        }
        
        requestData.fillBlankAnswers = questionData.fillBlankAnswers
          .filter(blank => blank && (blank.correctAnswer || blank.CorrectAnswer)) // Filter empty blanks
          .map(blank => {
            const correctAnswer = (blank.correctAnswer || blank.CorrectAnswer || '').trim();
            return {
              correctAnswer: correctAnswer,
              // Backend requires normalizedCorrectAnswer (from database model) - set it to lowercase of correctAnswer
              normalizedCorrectAnswer: blank.normalizedCorrectAnswer || blank.NormalizedCorrectAnswer || correctAnswer.toLowerCase(),
              // Backend requires explanation (from database model) - use empty string if not provided
              explanation: blank.explanation || blank.Explanation || ''
            };
          });
        
        // Validate at least one blank exists
        if (requestData.fillBlankAnswers.length === 0) {
          throw new Error('At least one FillBlank answer is required');
        }
        
        // Set multipleChoiceAnswers to null for FillBlank (not undefined, so it's included in JSON as null)
        // This helps ASP.NET Core model binding - some validators expect the field to exist
        requestData.multipleChoiceAnswers = null;
      }

      console.log('Creating question with data:', JSON.stringify(requestData, null, 2));

      const response = await api.post('/api/questions', requestData);

      // Backend returns QuestionResponse directly (not BaseResponse)
      // Check HTTP status code
      if (response.status === 201) {
        return {
          success: true,
          data: response.data,
          message: 'Tạo câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Tạo câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error creating question:', error);
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      let errorMessage = 'Tạo câu hỏi thất bại. Vui lòng thử lại.';
      
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
   * Get questions with query parameters
   * GET /api/questions?bankId={bankId}&type={type}&difficultyId={difficultyId}&active={active}&q={q}
   * @param {object} params - Query parameters
   * @param {number} params.bankId - Question bank ID (optional)
   * @param {number} params.type - Question type (optional)
   * @param {number} params.difficultyId - Difficulty ID (optional)
   * @param {boolean} params.active - Active status (optional)
   * @param {string} params.q - Search query (optional)
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  async getQuestions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.bankId !== undefined && params.bankId !== null) {
        queryParams.append('bankId', params.bankId);
      }
      if (params.type !== undefined && params.type !== null) {
        queryParams.append('type', params.type);
      }
      if (params.difficultyId !== undefined && params.difficultyId !== null) {
        queryParams.append('difficultyId', params.difficultyId);
      }
      if (params.active !== undefined && params.active !== null) {
        queryParams.append('active', params.active);
      }
      if (params.q) {
        queryParams.append('q', params.q);
      }

      const url = `/api/questions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);

      // Backend returns IEnumerable<QuestionResponse>
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
      console.error('Error fetching questions:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể tải danh sách câu hỏi';
      
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
   * Get question by ID
   * GET /api/questions/{id}
   * @param {number} id - Question ID
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getQuestionById(id) {
    try {
      const response = await api.get(`/api/questions/${id}`);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Lấy thông tin câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy thông tin câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể tải thông tin câu hỏi';
      
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
   * Update question
   * PUT /api/questions/{id}
   * @param {number} id - Question ID
   * @param {object} questionData - Updated question data (same format as createQuestion)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async updateQuestion(id, questionData) {
    try {
      // Convert frontend data format to backend PascalCase format
      const requestData = {
        QuestionBankId: questionData.questionBankId || questionData.QuestionBankId,
        Title: questionData.title || questionData.Title,
        Content: questionData.content || questionData.Content,
        QuestionTypeEnum: questionData.questionTypeEnum !== undefined 
          ? questionData.questionTypeEnum 
          : questionData.QuestionTypeEnum,
        QuestionDifficultyId: questionData.questionDifficultyId || questionData.QuestionDifficultyId || null,
        AdditionalData: questionData.additionalData || questionData.AdditionalData || null,
      };

      // Handle MultipleChoice answers
      if (requestData.QuestionTypeEnum === 0 && questionData.multipleChoiceAnswers) {
        requestData.MultipleChoiceAnswers = questionData.multipleChoiceAnswers.map(answer => ({
          AnswerText: answer.answerText || answer.text || answer.AnswerText,
          IsCorrect: answer.isCorrect !== undefined ? answer.isCorrect : (answer.IsCorrect !== undefined ? answer.IsCorrect : false),
          Explanation: answer.explanation || answer.Explanation || null,
          OrderIndex: answer.orderIndex !== undefined ? answer.orderIndex : (answer.OrderIndex !== undefined ? answer.OrderIndex : null)
        }));
      }

      // Handle FillBlank answers
      if (requestData.QuestionTypeEnum === 1 && questionData.fillBlankAnswers) {
        requestData.FillBlankAnswers = questionData.fillBlankAnswers.map(answer => ({
          CorrectAnswer: answer.correctAnswer || answer.CorrectAnswer,
          NormalizedCorrectAnswer: answer.normalizedCorrectAnswer || answer.NormalizedCorrectAnswer || null,
          Explanation: answer.explanation || answer.Explanation || null
        }));
      }

      const response = await api.put(`/api/questions/${id}`, requestData);

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
      console.error('Error updating question:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật câu hỏi thất bại. Vui lòng thử lại.';
      
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
   * Delete question
   * DELETE /api/questions/{id}
   * @param {number} id - Question ID
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deleteQuestion(id) {
    try {
      const response = await api.delete(`/api/questions/${id}`);

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
      console.error('Error deleting question:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Xóa câu hỏi thất bại. Vui lòng thử lại.';
      
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
   * Update question active status
   * PATCH /api/questions/{id}/active
   * @param {number} id - Question ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async updateQuestionStatus(id, isActive) {
    try {
      const response = await api.patch(`/api/questions/${id}/active`, { isActive });

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: isActive ? 'Kích hoạt câu hỏi thành công' : 'Tạm dừng câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Cập nhật trạng thái câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error updating question status:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật trạng thái câu hỏi thất bại. Vui lòng thử lại.';
      
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
   * Bulk create questions
   * POST /api/questions/bulk
   * @param {object} bulkData - Bulk creation data
   * @param {number} bulkData.questionBankId - Question bank ID
   * @param {Array} bulkData.items - Array of question create requests
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async bulkCreateQuestions(bulkData) {
    try {
      const requestData = {
        QuestionBankId: bulkData.questionBankId || bulkData.QuestionBankId,
        Items: (bulkData.items || bulkData.Items || []).map(item => ({
          QuestionBankId: item.questionBankId || item.QuestionBankId,
          Title: item.title || item.Title,
          Content: item.content || item.Content,
          QuestionTypeEnum: item.questionTypeEnum !== undefined 
            ? item.questionTypeEnum 
            : item.QuestionTypeEnum,
          QuestionDifficultyId: item.questionDifficultyId || item.QuestionDifficultyId || null,
          AdditionalData: item.additionalData || item.AdditionalData || null,
          MultipleChoiceAnswers: item.multipleChoiceAnswers || item.MultipleChoiceAnswers || null,
          FillBlankAnswers: item.fillBlankAnswers || item.FillBlankAnswers || null
        }))
      };

      const response = await api.post('/api/questions/bulk', requestData);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: `Tạo ${response.data?.Inserted || 0} câu hỏi thành công`
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Tạo câu hỏi hàng loạt thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error bulk creating questions:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Tạo câu hỏi hàng loạt thất bại. Vui lòng thử lại.';
      
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
   * Preview question
   * GET /api/questions/{id}/preview?randomized={randomized}
   * @param {number} id - Question ID
   * @param {boolean} randomized - Whether to randomize answers (optional)
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async previewQuestion(id, randomized = false) {
    try {
      const url = `/api/questions/${id}/preview${randomized ? '?randomized=true' : ''}`;
      const response = await api.get(url);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Lấy preview câu hỏi thành công'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: 'Lấy preview câu hỏi thất bại',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Error previewing question:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Không thể xem preview câu hỏi';
      
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

export default questionService;

