// studentTestService.js - Service for student tests

import api from './axios';

class StudentTestService {

    constructor() {
        this.baseURL = '/api/student/tests';
    }

    // Get available tests for student
    async getAvailableTests() {
        try {
            console.log('Fetching exams from /api/exams...');
            
            // Call the actual API endpoint GET /api/exams
            const response = await api.get('/api/exams');
            
            console.log('API Response:', {
                status: response.status,
                dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
                dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
                data: response.data
            });

            // Check if response.data is an array
            // API returns IEnumerable<ExamResponse> directly (status 200)
            const examsData = Array.isArray(response.data) ? response.data : [];
            
            if (examsData.length === 0) {
                console.log('No exams found in response');
                return {
                    success: true,
                    data: [],
                    message: 'Không có bài thi nào'
                };
            }
            
            // Transform API response to match our component's expected format
            const transformedTests = examsData.map((exam, index) => {
                try {
                    return {
                        id: exam.id || exam.Id || null,
                        title: exam.title || exam.Title || 'Không có tiêu đề',
                        description: exam.description || exam.Description || 'Không có mô tả',
                        subject: 'Hóa học', // Default subject, can be mapped from exam data if available
                        duration: exam.durationMinutes || exam.DurationMinutes || 60,
                        totalQuestions: exam.totalQuestions || exam.TotalQuestions || 0,
                        totalPoints: exam.totalPoints || exam.TotalPoints || 10,
                        deadline: exam.endTime || exam.EndTime || null,
                        startDate: exam.startTime || exam.StartTime || null,
                        difficulty: this.mapDifficulty(exam.gradeLevel || exam.GradeLevel),
                        status: this.mapStatus(exam.statusEnum || exam.StatusEnum, exam.startTime || exam.StartTime, exam.endTime || exam.EndTime),
                        teacher: exam.createdByTeacher || exam.CreatedByTeacher ? `Giáo viên ${exam.createdByTeacher || exam.CreatedByTeacher}` : 'Chưa xác định',
                        attempts: 0, // TODO: Get from exam attempts API if available
                        maxAttempts: exam.maxAttempts || exam.MaxAttempts || 1,
                        passScore: exam.passThreshold || exam.PassThreshold || 5.0,
                        tags: this.generateTags(exam),
                        // Additional fields from API
                        showResultsImmediately: exam.showResultsImmediately || exam.ShowResultsImmediately || false,
                        showCorrectAnswers: exam.showCorrectAnswers || exam.ShowCorrectAnswers || false,
                        randomizeQuestions: exam.randomizeQuestions || exam.RandomizeQuestions || false,
                        randomizeAnswers: exam.randomizeAnswers || exam.RandomizeAnswers || false,
                        examMatrixId: exam.examMatrixId || exam.ExamMatrixId || null
                    };
                } catch (transformError) {
                    console.error(`Error transforming exam at index ${index}:`, transformError, exam);
                    return null;
                }
            }).filter(test => test !== null); // Remove any failed transforms

            return {
                success: true,
                data: transformedTests,
                message: 'Lấy danh sách bài thi thành công'
            };
        } catch (error) {
            console.error('Error loading tests:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                request: error.config
            });
            
            const errorData = error.response?.data;
            let errorMessage = 'Không thể tải danh sách bài thi';
            
            if (errorData) {
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.Message) {
                    errorMessage = errorData.Message;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            }
            
            // If it's a 500 error, provide more specific message
            if (error.response?.status === 500) {
                errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
            }
            
            return {
                success: false,
                error: errorData || error.message,
                message: errorMessage,
                statusCode: error.response?.status
            };
        }
    }

    // Helper: Map grade level to difficulty
    mapDifficulty(gradeLevel) {
        if (!gradeLevel) return 'medium';
        if (gradeLevel <= 8) return 'easy';
        if (gradeLevel <= 10) return 'medium';
        return 'hard';
    }

    // Helper: Map status enum and dates to status string
    // EExamStatus: Draft = 0, Inactive = 1, Active = 2
    mapStatus(statusEnum, startTime, endTime) {
        try {
            const now = new Date();
            
            // Handle null/undefined statusEnum
            if (statusEnum === null || statusEnum === undefined) {
                return 'locked';
            }
            
            // Only Active (2) exams can be available
            if (statusEnum !== 2) {
                return 'locked';
            }
            
            // Check date range only if startTime and endTime are provided
            if (startTime && endTime) {
                try {
                    const start = new Date(startTime);
                    const end = new Date(endTime);
                    
                    // Validate dates
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                        console.warn('Invalid date range:', { startTime, endTime });
                        return 'available'; // Default to available if dates are invalid
                    }
                    
                    if (now < start) return 'locked';
                    if (now > end) return 'missed';
                } catch (dateError) {
                    console.warn('Error parsing dates:', dateError, { startTime, endTime });
                    return 'available'; // Default to available if date parsing fails
                }
            }
            
            // TODO: Check if student has completed this exam
            // For now, assume available if Active and within date range
            return 'available';
        } catch (error) {
            console.error('Error in mapStatus:', error, { statusEnum, startTime, endTime });
            return 'locked'; // Default to locked on error
        }
    }

    // Helper: Generate tags based on exam properties
    generateTags(exam) {
        try {
            const tags = [];
            const title = (exam.title || exam.Title || '').toLowerCase();
            
            if (title.includes('giữa kỳ') || title.includes('midterm')) {
                tags.push('Giữa kỳ');
            }
            if (title.includes('cuối kỳ') || title.includes('final')) {
                tags.push('Cuối kỳ');
            }
            if (title.includes('quiz')) {
                tags.push('Quiz');
            }
            if (exam.randomizeQuestions || exam.RandomizeQuestions) {
                tags.push('Câu hỏi ngẫu nhiên');
            }
            if (exam.showResultsImmediately || exam.ShowResultsImmediately) {
                tags.push('Xem kết quả ngay');
            }
            
            return tags;
        } catch (error) {
            console.warn('Error generating tags:', error, exam);
            return [];
        }
    }

    // Get test details by ID
    async getTestById(testId) {
        try {
            const response = await api.get(`/api/exams/${testId}`);
            const exam = response.data;

            // Transform single exam to match component format
            const transformedTest = {
                id: exam.id,
                title: exam.title,
                description: exam.description || 'Không có mô tả',
                subject: 'Hóa học',
                duration: exam.durationMinutes,
                totalQuestions: exam.totalQuestions || 0,
                totalPoints: exam.totalPoints || 10,
                deadline: exam.endTime,
                startDate: exam.startTime,
                difficulty: this.mapDifficulty(exam.gradeLevel),
                status: this.mapStatus(exam.statusEnum, exam.startTime, exam.endTime),
                teacher: exam.createdByTeacher ? `Giáo viên ${exam.createdByTeacher}` : 'Chưa xác định',
                attempts: 0,
                maxAttempts: exam.maxAttempts || 1,
                passScore: exam.passThreshold || 5.0,
                tags: this.generateTags(exam),
                showResultsImmediately: exam.showResultsImmediately,
                showCorrectAnswers: exam.showCorrectAnswers,
                randomizeQuestions: exam.randomizeQuestions,
                randomizeAnswers: exam.randomizeAnswers,
                examMatrixId: exam.examMatrixId,
                questions: exam.questions || []
            };

            return {
                success: true,
                data: transformedTest,
                message: 'Test details loaded successfully'
            };
        } catch (error) {
            console.error('Error loading test details:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to load test details'
            };
        }
    }

    // Start a test
    async startTest(testId) {
        await this.delay(800);

        try {
            return {
                success: true,
                data: {
                    sessionId: `session_${testId}_${Date.now()}`,
                    startTime: new Date().toISOString(),
                },
                message: 'Test started successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to start test'
            };
        }
    }

    // Filter tests by status
    filterTestsByStatus(tests, status) {
        if (!status || status === 'all') return tests;
        return tests.filter(test => test.status === status);
    }

    // Sort tests
    sortTests(tests, sortBy = 'deadline') {
        const sorted = [...tests];
        switch (sortBy) {
            case 'deadline':
                return sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            case 'title':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'difficulty':
                const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
                return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
            default:
                return sorted;
        }
    }

    // Check if test is available to take
    isTestAvailable(test) {
        const now = new Date();
        const startDate = new Date(test.startDate);
        const deadline = new Date(test.deadline);
        
        return test.status === 'available' && 
               now >= startDate && 
               now <= deadline &&
               test.attempts < test.maxAttempts;
    }

    // Get time remaining for test
    getTimeRemaining(deadline) {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end - now;
        
        if (diff <= 0) return 'Đã hết hạn';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `Còn ${days} ngày`;
        if (hours > 0) return `Còn ${hours} giờ`;
        return `Còn ${minutes} phút`;
    }
}

// Export singleton instance
const studentTestService = new StudentTestService();
export default studentTestService;
