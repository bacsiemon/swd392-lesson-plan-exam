// studentTestService.js - Service for student tests
class StudentTestService {
    constructor() {
        this.baseURL = '/api/student/tests';
    }

    // Simulate network delay
    delay(ms = 800) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get available tests for student
    async getAvailableTests() {
        await this.delay(600);

        try {
            // Mock data - In production, replace with actual API call
            const mockTests = [
                {
                    id: 1,
                    title: 'Kiểm tra giữa kỳ - Hóa vô cơ',
                    description: 'Kiểm tra kiến thức về Hóa vô cơ: Bảng tuần hoàn, phản ứng oxi hóa khử, axit-bazơ',
                    subject: 'Hóa học',
                    duration: 60, // minutes
                    totalQuestions: 30,
                    totalPoints: 10,
                    deadline: '2024-11-05T23:59:59',
                    startDate: '2024-10-20T00:00:00',
                    difficulty: 'medium',
                    status: 'available', // available, completed, missed, locked
                    teacher: 'Lê Thị Hương',
                    attempts: 0,
                    maxAttempts: 2,
                    passScore: 5.0,
                    tags: ['Giữa kỳ', 'Hóa vô cơ', 'Quan trọng']
                },
                {
                    id: 2,
                    title: 'Quiz nhanh - Bảng tuần hoàn',
                    description: 'Câu hỏi trắc nghiệm về các nguyên tố và cấu trúc bảng tuần hoàn',
                    subject: 'Hóa học',
                    duration: 15,
                    totalQuestions: 10,
                    totalPoints: 10,
                    deadline: '2024-11-02T23:59:59',
                    startDate: '2024-10-28T00:00:00',
                    difficulty: 'easy',
                    status: 'available',
                    teacher: 'Lê Thị Hương',
                    attempts: 1,
                    maxAttempts: 3,
                    passScore: 6.0,
                    lastScore: 7.5,
                    tags: ['Quiz', 'Bảng tuần hoàn']
                },
                {
                    id: 3,
                    title: 'Bài tập về nhà - Hóa hữu cơ',
                    description: 'Các bài tập về phản ứng hữu cơ, đồng phân và danh pháp',
                    subject: 'Hóa học',
                    duration: 45,
                    totalQuestions: 20,
                    totalPoints: 10,
                    deadline: '2024-11-10T23:59:59',
                    startDate: '2024-10-25T00:00:00',
                    difficulty: 'medium',
                    status: 'available',
                    teacher: 'Lê Thị Hương',
                    attempts: 0,
                    maxAttempts: 1,
                    passScore: 5.0,
                    tags: ['Bài tập', 'Hóa hữu cơ']
                },
                {
                    id: 4,
                    title: 'Kiểm tra cuối kỳ - Tổng hợp',
                    description: 'Kiểm tra tổng hợp kiến thức cả học kỳ: Hóa vô cơ và Hóa hữu cơ',
                    subject: 'Hóa học',
                    duration: 90,
                    totalQuestions: 50,
                    totalPoints: 10,
                    deadline: '2024-11-30T23:59:59',
                    startDate: '2024-11-20T00:00:00',
                    difficulty: 'hard',
                    status: 'locked',
                    teacher: 'Lê Thị Hương',
                    attempts: 0,
                    maxAttempts: 1,
                    passScore: 5.0,
                    tags: ['Cuối kỳ', 'Tổng hợp', 'Quan trọng']
                },
                {
                    id: 5,
                    title: 'Kiểm tra 15 phút - Phản ứng hóa học',
                    description: 'Kiểm tra nhanh về các loại phản ứng hóa học cơ bản',
                    subject: 'Hóa học',
                    duration: 15,
                    totalQuestions: 8,
                    totalPoints: 10,
                    deadline: '2024-10-30T23:59:59',
                    startDate: '2024-10-20T00:00:00',
                    difficulty: 'easy',
                    status: 'completed',
                    teacher: 'Lê Thị Hương',
                    attempts: 1,
                    maxAttempts: 1,
                    passScore: 5.0,
                    lastScore: 8.5,
                    completedDate: '2024-10-22T14:30:00',
                    tags: ['Kiểm tra 15 phút']
                },
                {
                    id: 6,
                    title: 'Ôn tập - Axit và Bazơ',
                    description: 'Bài tập ôn tập về tính chất và phản ứng của axit, bazơ',
                    subject: 'Hóa học',
                    duration: 30,
                    totalQuestions: 15,
                    totalPoints: 10,
                    deadline: '2024-10-28T23:59:59',
                    startDate: '2024-10-15T00:00:00',
                    difficulty: 'medium',
                    status: 'missed',
                    teacher: 'Lê Thị Hương',
                    attempts: 0,
                    maxAttempts: 2,
                    passScore: 5.0,
                    tags: ['Ôn tập', 'Axit-Bazơ']
                }
            ];

            return {
                success: true,
                data: mockTests,
                message: 'Tests loaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to load tests'
            };
        }
    }

    // Get test details by ID
    async getTestById(testId) {
        await this.delay(500);

        try {
            // Mock single test data
            return {
                success: true,
                data: {
                    id: testId,
                    title: 'Kiểm tra giữa kỳ - Hóa vô cơ',
                    // ... other fields
                },
                message: 'Test details loaded successfully'
            };
        } catch (error) {
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
