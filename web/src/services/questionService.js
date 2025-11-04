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
      
      // Ensure questionBankId is a valid number
      const questionBankId = questionData.questionBankId || questionData.QuestionBankId;
      if (!questionBankId) {
        throw new Error('questionBankId is required');
      }
      
      const parsedBankId = parseInt(questionBankId);
      if (isNaN(parsedBankId) || parsedBankId <= 0) {
        throw new Error(`Invalid questionBankId: ${questionBankId}. Must be a positive number.`);
      }
      
      // Backend DTO uses PascalCase (QuestionBankId, Title, Content, etc.)
      // ASP.NET Core model binding can handle both, but DTO properties are PascalCase
      // Use PascalCase to match DTO exactly: { QuestionBankId, Title, Content, QuestionTypeEnum, MultipleChoiceAnswers, FillBlankAnswers }
      const requestData = {
        QuestionBankId: parsedBankId, // Backend DTO: public int QuestionBankId { get; set; }
        Title: (questionData.title || questionData.Title || '').trim(), // Backend DTO: public string Title { get; set; }
        Content: (questionData.content || questionData.Content || '').trim(), // Backend DTO: public string Content { get; set; }
        QuestionTypeEnum: questionTypeEnum, // Backend DTO: public EQuestionType QuestionTypeEnum { get; set; }
        // QuestionDifficultyId is optional (nullable int?)
        // Only send if explicitly provided and valid (positive integer > 0)
        // If not provided or invalid, send null to avoid foreign key constraint violations
        QuestionDifficultyId: (() => {
          const difficultyId = questionData.questionDifficultyId !== undefined && questionData.questionDifficultyId !== null
            ? questionData.questionDifficultyId
            : (questionData.QuestionDifficultyId !== undefined && questionData.QuestionDifficultyId !== null
                ? questionData.QuestionDifficultyId
                : null);
          
          // Only include if it's a valid positive integer
          // Note: Backend needs to validate existence in question_difficulties table
          // For now, we allow null to avoid foreign key errors
          if (difficultyId === null || difficultyId === undefined || difficultyId === '' || difficultyId === 0) {
            return null;
          }
          
          const parsed = parseInt(difficultyId);
          if (isNaN(parsed) || parsed <= 0) {
            console.warn(`Invalid QuestionDifficultyId: ${difficultyId}. Setting to null to avoid foreign key constraint.`);
            return null;
          }
          
          // Note: Backend should validate existence of difficulty ID in question_difficulties table
          // For now, we'll send it and let backend return a proper validation error if it doesn't exist
          // However, if we want to avoid 500 errors, we could make an API call to check first
          // For now, we'll return the parsed value and handle the error in the catch block
          return parsed;
        })(),
        // Backend repository converts: null/empty -> "{}", otherwise use as-is (should be valid JSON string)
        // If additionalData is already a JSON string, use it; if it's a plain string, wrap it; if null/undefined, send null
        AdditionalData: (() => {
          const ad = questionData.additionalData || questionData.AdditionalData;
          if (!ad || ad === null || ad === '') {
            return null; // Backend will convert to "{}"
          }
          // If it's already valid JSON, use it
          try {
            JSON.parse(ad);
            return ad; // Already valid JSON
          } catch {
            // Not valid JSON, wrap it
            return JSON.stringify({ explanation: ad });
          }
        })()
      };

      // Validate required fields
      if (!requestData.Title || requestData.Title.length === 0) {
        throw new Error('Title is required');
      }
      if (!requestData.Content || requestData.Content.length === 0) {
        throw new Error('Content is required');
      }

      // Handle MultipleChoice answers
      if (questionTypeEnum === 0) {
        if (!questionData.multipleChoiceAnswers || questionData.multipleChoiceAnswers.length === 0) {
          throw new Error('multipleChoiceAnswers is required for MultipleChoice question type');
        }
        
        // Backend DTO: List<MultipleChoiceAnswerPayload>? MultipleChoiceAnswers
        // Backend payload properties: AnswerText, IsCorrect, Explanation?, OrderIndex?
        requestData.MultipleChoiceAnswers = questionData.multipleChoiceAnswers
          .filter(answer => answer && (answer.answerText || answer.text || answer.AnswerText)) // Filter empty answers
          .map((answer, index) => ({
            AnswerText: (answer.answerText || answer.text || answer.AnswerText || '').trim(), // Backend: public string AnswerText { get; set; }
            IsCorrect: answer.isCorrect !== undefined ? answer.isCorrect : (answer.IsCorrect !== undefined ? answer.IsCorrect : false), // Backend: public bool IsCorrect { get; set; }
            Explanation: answer.explanation || answer.Explanation || '', // Backend: public string? Explanation { get; set; }
            OrderIndex: answer.orderIndex !== undefined ? answer.orderIndex : (answer.OrderIndex !== undefined ? answer.OrderIndex : index + 1) // Backend: public int? OrderIndex { get; set; }
          }));
        
        // Validate at least one answer exists
        if (requestData.MultipleChoiceAnswers.length === 0) {
          throw new Error('At least one MultipleChoice answer is required');
        }
        
        // Set FillBlankAnswers to null for MultipleChoice (not undefined, so it's included in JSON as null)
        // This helps ASP.NET Core model binding - some validators expect the field to exist
        requestData.FillBlankAnswers = null;
      }

      // Handle FillBlank answers
      if (questionTypeEnum === 1) {
        if (!questionData.fillBlankAnswers || questionData.fillBlankAnswers.length === 0) {
          throw new Error('fillBlankAnswers is required for FillBlank question type');
        }
        
        // Backend DTO: List<FillBlankAnswerPayload>? FillBlankAnswers
        // Backend payload properties: CorrectAnswer, NormalizedCorrectAnswer?, Explanation?
        requestData.FillBlankAnswers = questionData.fillBlankAnswers
          .filter(blank => blank && (blank.correctAnswer || blank.CorrectAnswer)) // Filter empty blanks
          .map(blank => {
            const correctAnswer = (blank.correctAnswer || blank.CorrectAnswer || '').trim();
            
            // Validate correctAnswer is not empty
            if (!correctAnswer || correctAnswer.length === 0) {
              throw new Error('Mỗi chỗ trống phải có đáp án đúng');
            }
            
            // Backend database requires NormalizedCorrectAnswer to be non-null (Required field)
            // Backend repository will handle if null, but let's provide it explicitly to avoid 500 errors
            const normalizedAnswer = (blank.normalizedCorrectAnswer || blank.NormalizedCorrectAnswer || '').trim();
            const finalNormalized = normalizedAnswer || correctAnswer.toLowerCase();
            
            return {
              CorrectAnswer: correctAnswer, // Backend: public string CorrectAnswer { get; set; }
              // Backend database requires NormalizedCorrectAnswer to be non-null - MUST provide it
              NormalizedCorrectAnswer: finalNormalized, // Backend: public string? NormalizedCorrectAnswer { get; set; }
              Explanation: blank.explanation || blank.Explanation || '' // Backend: public string? Explanation { get; set; }
            };
          });
        
        // Validate at least one blank exists
        if (requestData.FillBlankAnswers.length === 0) {
          throw new Error('At least one FillBlank answer is required');
        }
        
        // Validate all blanks have non-empty normalizedCorrectAnswer
        for (const blank of requestData.FillBlankAnswers) {
          if (!blank.NormalizedCorrectAnswer || blank.NormalizedCorrectAnswer.trim().length === 0) {
            throw new Error('Mỗi chỗ trống phải có normalizedCorrectAnswer');
          }
        }
        
        // Set MultipleChoiceAnswers to null for FillBlank (not undefined, so it's included in JSON as null)
        // This helps ASP.NET Core model binding - some validators expect the field to exist
        requestData.MultipleChoiceAnswers = null;
      }

      console.log('Creating question with data (PascalCase to match backend DTO):', JSON.stringify(requestData, null, 2));
      console.log('QuestionBankId type:', typeof requestData.QuestionBankId, 'value:', requestData.QuestionBankId);
      console.log('QuestionTypeEnum:', requestData.QuestionTypeEnum);
      console.log('MultipleChoiceAnswers:', requestData.MultipleChoiceAnswers ? `${requestData.MultipleChoiceAnswers.length} answers` : 'null');
      console.log('FillBlankAnswers:', requestData.FillBlankAnswers ? `${requestData.FillBlankAnswers.length} blanks` : 'null');

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
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Log request data if available (might not be available if error occurs before requestData is created)
      try {
        const requestDataSnapshot = {
          QuestionBankId: parsedBankId,
          Title: (questionData.title || questionData.Title || '').trim(),
          Content: (questionData.content || questionData.Content || '').trim(),
          QuestionTypeEnum: questionTypeEnum,
          QuestionDifficultyId: questionData.questionDifficultyId !== undefined && questionData.questionDifficultyId !== null
            ? (parseInt(questionData.questionDifficultyId) || questionData.questionDifficultyId)
            : (questionData.QuestionDifficultyId !== undefined && questionData.QuestionDifficultyId !== null
                ? (parseInt(questionData.QuestionDifficultyId) || questionData.QuestionDifficultyId)
                : null),
          MultipleChoiceAnswers: questionData.multipleChoiceAnswers ? `${questionData.multipleChoiceAnswers.length} answers` : 'none',
          FillBlankAnswers: questionData.fillBlankAnswers ? `${questionData.fillBlankAnswers.length} blanks` : 'none'
        };
        console.error('Request data that failed:', JSON.stringify(requestDataSnapshot, null, 2));
      } catch (logError) {
        console.error('Could not log request data:', logError);
      }
      
      const errorData = error.response?.data;
      let errorMessage = 'Tạo câu hỏi thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        // Handle FluentValidation errors (400 Bad Request)
        if (errorData.errors) {
          const errorMessages = [];
          Object.keys(errorData.errors).forEach(key => {
            const messages = errorData.errors[key];
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        } else if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Handle 500 Internal Server Error - check for common database errors
        if (error.response?.status === 500) {
          const errorString = JSON.stringify(errorData).toLowerCase();
          // Use parsedBankId from try block scope (defined before requestData)
          const bankId = parsedBankId || questionData.questionBankId || questionData.QuestionBankId || 'N/A';
          const diffId = questionData.questionDifficultyId !== undefined && questionData.questionDifficultyId !== null && questionData.questionDifficultyId !== '' && questionData.questionDifficultyId !== 0
            ? questionData.questionDifficultyId
            : (questionData.QuestionDifficultyId !== undefined && questionData.QuestionDifficultyId !== null && questionData.QuestionDifficultyId !== '' && questionData.QuestionDifficultyId !== 0
                ? questionData.QuestionDifficultyId
                : 'N/A');
          
          if (errorString.includes('foreign key') || errorString.includes('constraint')) {
            if (errorString.includes('question_bank_id') || errorString.includes('questionbank')) {
              errorMessage = `Ngân hàng câu hỏi với ID ${bankId} không tồn tại. Vui lòng kiểm tra lại.`;
            } else if (errorString.includes('question_difficulty_id') || errorString.includes('questiondifficulty') || errorString.includes('question_difficulties')) {
              errorMessage = `Độ khó với ID ${diffId} không tồn tại trong database. Vui lòng bỏ trống hoặc chọn độ khó hợp lệ.`;
            } else {
              errorMessage = 'Lỗi ràng buộc dữ liệu: Có thể do dữ liệu liên quan không tồn tại. Vui lòng kiểm tra lại.';
            }
          } else if (errorString.includes('null') || errorString.includes('required')) {
            errorMessage = 'Lỗi dữ liệu: Một số trường bắt buộc bị thiếu. Vui lòng kiểm tra lại.';
          } else {
            // Backend ExceptionMiddleware returns BaseResponse with Message: "INTERNAL_SERVER_ERROR" and Errors: ex.ToString()
            const backendMessage = errorData.Message || errorData.message || '';
            const backendErrors = errorData.Errors || errorData.errors || '';
            if (backendErrors && backendErrors.length > 0) {
              errorMessage = `Lỗi server: ${backendErrors.substring(0, 200)}...`; // Limit error message length
            } else {
              errorMessage = `Lỗi server: ${backendMessage || 'Vui lòng thử lại sau.'}`;
            }
          }
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
      // Use camelCase format to match createQuestion and backend sample
      // Backend sample in controller uses camelCase: { questionBankId, title, content, questionTypeEnum, multipleChoiceAnswers/fillBlankAnswers }
      
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
        
        // Set fillBlankAnswers to null for MultipleChoice (not undefined)
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
              // Backend requires normalizedCorrectAnswer - set it to lowercase of correctAnswer
              normalizedCorrectAnswer: blank.normalizedCorrectAnswer || blank.NormalizedCorrectAnswer || correctAnswer.toLowerCase(),
              // Backend requires explanation - use empty string if not provided
              explanation: blank.explanation || blank.Explanation || ''
            };
          });
        
        // Validate at least one blank exists
        if (requestData.fillBlankAnswers.length === 0) {
          throw new Error('At least one FillBlank answer is required');
        }
        
        // Set multipleChoiceAnswers to null for FillBlank (not undefined)
        requestData.multipleChoiceAnswers = null;
      }

      console.log('Updating question with data:', JSON.stringify(requestData, null, 2));

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
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      let errorMessage = 'Cập nhật câu hỏi thất bại. Vui lòng thử lại.';
      
      if (errorData) {
        // Handle FluentValidation errors
        if (errorData.errors) {
          const errorMessages = [];
          Object.keys(errorData.errors).forEach(key => {
            const messages = errorData.errors[key];
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
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

