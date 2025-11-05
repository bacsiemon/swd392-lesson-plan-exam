// studentTestService.js - Service for student tests

import api from './axios';

class StudentTestService {

    constructor() {
        this.baseURL = '/api/student/tests';
    }

    // Get available tests for student
    async getAvailableTests() {
        try {
            // Get the logged-in user info to determine role and ID
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const userId = userInfo.id;
            
            // Call the actual API endpoint
            // Note: Adjust query parameters based on your needs
            const response = await api.get('/api/exams', {
                params: {
                    // teacherId: userId, // Uncomment if needed for teacher filtering
                    status: 0, // 0 = Active exams
                    // q: '' // Search query if needed
                }
            });

            // Transform API response to match our component's expected format
            const transformedTests = response.data.map(exam => ({
                id: exam.id,
                title: exam.title,
                description: exam.description || 'Không có mô tả',
                subject: 'Hóa học', // Default subject, can be mapped from exam data if available
                duration: exam.durationMinutes,
                totalQuestions: exam.totalQuestions || 0,
                totalPoints: exam.totalPoints || 10,
                deadline: exam.endTime,
                startDate: exam.startTime,
                difficulty: this.mapDifficulty(exam.gradeLevel),
                status: this.mapStatus(exam.statusEnum, exam.startTime, exam.endTime),
                teacher: exam.createdByTeacher ? `Giáo viên ${exam.createdByTeacher}` : 'Chưa xác định',
                attempts: 0, // TODO: Get from exam attempts API if available
                maxAttempts: exam.maxAttempts || 1,
                passScore: exam.passThreshold || 5.0,
                tags: this.generateTags(exam),
                // Additional fields from API
                showResultsImmediately: exam.showResultsImmediately,
                showCorrectAnswers: exam.showCorrectAnswers,
                randomizeQuestions: exam.randomizeQuestions,
                randomizeAnswers: exam.randomizeAnswers,
                examMatrixId: exam.examMatrixId
            }));

            return {
                success: true,
                data: transformedTests,
                message: 'Tests loaded successfully'
            };
        } catch (error) {
            console.error('Error loading tests:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to load tests'
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
    mapStatus(statusEnum, startTime, endTime) {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        // statusEnum: 0 = Active, 1 = Inactive, etc.
        if (statusEnum !== 0) return 'locked';
        
        if (now < start) return 'locked';
        if (now > end) return 'missed';
        
        // TODO: Check if student has completed this exam
        // For now, assume available if within date range and active
        return 'available';
    }

    // Helper: Generate tags based on exam properties
    generateTags(exam) {
        const tags = [];
        
        if (exam.title.toLowerCase().includes('giữa kỳ') || exam.title.toLowerCase().includes('midterm')) {
            tags.push('Giữa kỳ');
        }
        if (exam.title.toLowerCase().includes('cuối kỳ') || exam.title.toLowerCase().includes('final')) {
            tags.push('Cuối kỳ');
        }
        if (exam.title.toLowerCase().includes('quiz')) {
            tags.push('Quiz');
        }
        if (exam.randomizeQuestions) {
            tags.push('Câu hỏi ngẫu nhiên');
        }
        if (exam.showResultsImmediately) {
            tags.push('Xem kết quả ngay');
        }
        
        return tags;
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
