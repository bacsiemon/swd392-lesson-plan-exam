// Service để gọi API liên quan đến Question Bank
// Tạm thời sử dụng mock data, sau này sẽ thay bằng API thật

const API_BASE_URL = 'http://localhost:5000/api'; // URL của backend API

// Mock data cho development - Question Banks
const mockQuestionBanks = [
  {
    id: 1,
    name: 'Ngân hàng câu hỏi Hóa học 10 - Nguyên tử',
    gradeLevel: 10,
    teacherId: 1,
    description: 'Câu hỏi về cấu tạo nguyên tử, electron, proton, neutron và các tính chất hóa học cơ bản',
    statusEnum: 1,
    createdAt: '2024-01-15T08:00:00',
    updatedAt: '2024-01-15T08:00:00',
    questionCount: 25
  },
  {
    id: 2,
    name: 'Ngân hàng câu hỏi Hóa học 11 - Bảng tuần hoàn',
    gradeLevel: 11,
    teacherId: 1,
    description: 'Câu hỏi về bảng tuần hoàn các nguyên tố hóa học, tính chất tuần hoàn và quy luật',
    statusEnum: 0,
    createdAt: '2024-01-20T10:00:00',
    updatedAt: '2024-01-20T10:00:00',
    questionCount: 18
  },
  {
    id: 3,
    name: 'Ngân hàng câu hỏi Hóa học 12 - Hóa hữu cơ',
    gradeLevel: 12,
    teacherId: 1,
    description: 'Câu hỏi về các hợp chất hữu cơ, phản ứng hữu cơ và ứng dụng',
    statusEnum: 1,
    createdAt: '2024-02-01T14:30:00',
    updatedAt: '2024-02-01T14:30:00',
    questionCount: 32
  }
];

// Mock data cho development - Questions
const mockQuestions = [
  {
    id: 1,
    questionBankId: 1,
    questionDifficultyId: 1,
    title: 'Cấu tạo nguyên tử Carbon',
    content: 'Nguyên tử Carbon (C) có số hiệu nguyên tử là 6. Hỏi nguyên tử Carbon có bao nhiêu electron?',
    questionTypeEnum: 0,
    additionalData: JSON.stringify({
      answers: [
        { id: 'A', text: '4', isCorrect: false },
        { id: 'B', text: '6', isCorrect: true },
        { id: 'C', text: '8', isCorrect: false },
        { id: 'D', text: '12', isCorrect: false }
      ],
      explanation: 'Số electron trong nguyên tử trung hòa bằng số hiệu nguyên tử.'
    }),
    isActive: true,
    createdAt: '2024-01-15T08:30:00'
  },
  {
    id: 2,
    questionBankId: 1,
    questionDifficultyId: 2,
    title: 'Liên kết ion',
    content: 'Hoàn thành câu sau: Liên kết ion được hình thành giữa _____ và _____.',
    questionTypeEnum: 1,
    additionalData: JSON.stringify({
      blanks: [
        { position: 1, correctAnswer: 'kim loại', alternatives: ['kim loại', 'nguyên tố kim loại'] },
        { position: 2, correctAnswer: 'phi kim', alternatives: ['phi kim', 'nguyên tố phi kim'] }
      ],
      explanation: 'Liên kết ion hình thành khi kim loại nhường electron cho phi kim.'
    }),
    isActive: true,
    createdAt: '2024-01-15T09:00:00'
  },
  {
    id: 3,
    questionBankId: 2,
    questionDifficultyId: 3,
    title: 'Tính chất tuần hoàn',
    content: 'Trong một chu kì của bảng tuần hoàn, theo chiều tăng dần của số hiệu nguyên tử, bán kính nguyên tử sẽ như thế nào?',
    questionTypeEnum: 0,
    additionalData: JSON.stringify({
      answers: [
        { id: 'A', text: 'Tăng dần', isCorrect: false },
        { id: 'B', text: 'Giảm dần', isCorrect: true },
        { id: 'C', text: 'Không đổi', isCorrect: false },
        { id: 'D', text: 'Tăng rồi giảm', isCorrect: false }
      ],
      explanation: 'Trong chu kì, bán kính nguyên tử giảm dần do điện tích hạt nhân tăng.'
    }),
    isActive: true,
    createdAt: '2024-01-20T11:00:00'
  }
];

// Utility function để simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Question Bank Services
export const questionBankService = {
  // Lấy danh sách ngân hàng câu hỏi
  async getQuestionBanks(params = {}) {
    try {
      await simulateDelay(300);

      const { page = 1, pageSize = 10, gradeLevel, status, search } = params;
      let filteredData = [...mockQuestionBanks];

      // Filter by grade level
      if (gradeLevel !== undefined) {
        filteredData = filteredData.filter(item => item.gradeLevel === parseInt(gradeLevel));
      }

      // Filter by status
      if (status !== undefined) {
        filteredData = filteredData.filter(item => item.statusEnum === parseInt(status));
      }

      // Filter by search text
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        success: true,
        data: filteredData.slice(start, end),
        pagination: {
          current: page,
          pageSize,
          total: filteredData.length
        }
      };
    } catch (error) {
      console.error('Error fetching question banks:', error);
      return { success: false, message: 'Không thể tải danh sách ngân hàng câu hỏi' };
    }
  },

  // Tạo ngân hàng câu hỏi mới
  async createQuestionBank(data) {
    try {
      await simulateDelay(500);

      const newQuestionBank = {
        id: Math.max(...mockQuestionBanks.map(item => item.id), 0) + 1,
        ...data,
        teacherId: 1, // Mock teacher ID
        statusEnum: 0, // Pending approval
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionCount: 0
      };

      mockQuestionBanks.push(newQuestionBank);

      return {
        success: true,
        data: newQuestionBank,
        message: 'Tạo ngân hàng câu hỏi thành công'
      };
    } catch (error) {
      console.error('Error creating question bank:', error);
      return { success: false, message: 'Không thể tạo ngân hàng câu hỏi' };
    }
  },

  // Cập nhật ngân hàng câu hỏi
  async updateQuestionBank(id, data) {
    try {
      await simulateDelay(400);

      const index = mockQuestionBanks.findIndex(item => item.id === id);
      if (index !== -1) {
        mockQuestionBanks[index] = {
          ...mockQuestionBanks[index],
          ...data,
          updatedAt: new Date().toISOString()
        };

        return {
          success: true,
          data: mockQuestionBanks[index],
          message: 'Cập nhật ngân hàng câu hỏi thành công'
        };
      }

      return { success: false, message: 'Không tìm thấy ngân hàng câu hỏi' };
    } catch (error) {
      console.error('Error updating question bank:', error);
      return { success: false, message: 'Không thể cập nhật ngân hàng câu hỏi' };
    }
  },

  // Xóa ngân hàng câu hỏi
  async deleteQuestionBank(id) {
    try {
      await simulateDelay(300);

      const index = mockQuestionBanks.findIndex(item => item.id === id);
      if (index !== -1) {
        // Cũng xóa tất cả questions thuộc về question bank này
        const questionIndicesToRemove = [];
        for (let i = mockQuestions.length - 1; i >= 0; i--) {
          if (mockQuestions[i].questionBankId === id) {
            questionIndicesToRemove.push(i);
          }
        }
        questionIndicesToRemove.forEach(i => mockQuestions.splice(i, 1));

        mockQuestionBanks.splice(index, 1);
        return {
          success: true,
          message: 'Xóa ngân hàng câu hỏi thành công'
        };
      }

      return { success: false, message: 'Không tìm thấy ngân hàng câu hỏi' };
    } catch (error) {
      console.error('Error deleting question bank:', error);
      return { success: false, message: 'Không thể xóa ngân hàng câu hỏi' };
    }
  },

  // Lấy thông tin chi tiết một ngân hàng câu hỏi
  async getQuestionBankById(id) {
    try {
      await simulateDelay(200);

      const questionBank = mockQuestionBanks.find(item => item.id === id);
      if (questionBank) {
        return {
          success: true,
          data: questionBank
        };
      }

      return { success: false, message: 'Không tìm thấy ngân hàng câu hỏi' };
    } catch (error) {
      console.error('Error fetching question bank:', error);
      return { success: false, message: 'Không thể tải thông tin ngân hàng câu hỏi' };
    }
  }
};

// Question Services
export const questionService = {
  // Lấy danh sách câu hỏi
  async getQuestions(questionBankId, params = {}) {
    try {
      await simulateDelay(300);

      const { page = 1, pageSize = 10, questionType, difficulty, search } = params;
      let filteredData = mockQuestions.filter(q => q.questionBankId === questionBankId);

      // Filter by question type
      if (questionType !== undefined) {
        filteredData = filteredData.filter(item => item.questionTypeEnum === parseInt(questionType));
      }

      // Filter by difficulty
      if (difficulty !== undefined) {
        filteredData = filteredData.filter(item => item.questionDifficultyId === parseInt(difficulty));
      }

      // Filter by search text
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        success: true,
        data: filteredData.slice(start, end),
        pagination: {
          current: page,
          pageSize,
          total: filteredData.length
        }
      };
    } catch (error) {
      console.error('Error fetching questions:', error);
      return { success: false, message: 'Không thể tải danh sách câu hỏi' };
    }
  },

  // Tạo câu hỏi mới
  async createQuestion(data) {
    try {
      await simulateDelay(400);

      const newQuestion = {
        id: Math.max(...mockQuestions.map(item => item.id), 0) + 1,
        ...data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockQuestions.push(newQuestion);

      // Update question count in question bank
      const questionBank = mockQuestionBanks.find(qb => qb.id === data.questionBankId);
      if (questionBank) {
        questionBank.questionCount = (questionBank.questionCount || 0) + 1;
      }

      return {
        success: true,
        data: newQuestion,
        message: 'Tạo câu hỏi thành công'
      };
    } catch (error) {
      console.error('Error creating question:', error);
      return { success: false, message: 'Không thể tạo câu hỏi' };
    }
  },

  // Cập nhật câu hỏi
  async updateQuestion(id, data) {
    try {
      await simulateDelay(400);

      const index = mockQuestions.findIndex(item => item.id === id);
      if (index !== -1) {
        mockQuestions[index] = {
          ...mockQuestions[index],
          ...data,
          updatedAt: new Date().toISOString()
        };

        return {
          success: true,
          data: mockQuestions[index],
          message: 'Cập nhật câu hỏi thành công'
        };
      }

      return { success: false, message: 'Không tìm thấy câu hỏi' };
    } catch (error) {
      console.error('Error updating question:', error);
      return { success: false, message: 'Không thể cập nhật câu hỏi' };
    }
  },

  // Xóa câu hỏi
  async deleteQuestion(id) {
    try {
      await simulateDelay(300);

      const index = mockQuestions.findIndex(item => item.id === id);
      if (index !== -1) {
        const question = mockQuestions[index];
        mockQuestions.splice(index, 1);

        // Update question count in question bank
        const questionBank = mockQuestionBanks.find(qb => qb.id === question.questionBankId);
        if (questionBank && questionBank.questionCount > 0) {
          questionBank.questionCount -= 1;
        }

        return {
          success: true,
          message: 'Xóa câu hỏi thành công'
        };
      }

      return { success: false, message: 'Không tìm thấy câu hỏi' };
    } catch (error) {
      console.error('Error deleting question:', error);
      return { success: false, message: 'Không thể xóa câu hỏi' };
    }
  },

  // Lấy thông tin chi tiết một câu hỏi
  async getQuestionById(id) {
    try {
      await simulateDelay(200);

      const question = mockQuestions.find(item => item.id === id);
      if (question) {
        return {
          success: true,
          data: question
        };
      }

      return { success: false, message: 'Không tìm thấy câu hỏi' };
    } catch (error) {
      console.error('Error fetching question:', error);
      return { success: false, message: 'Không thể tải thông tin câu hỏi' };
    }
  }
};