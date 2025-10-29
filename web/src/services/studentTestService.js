// studentTestService.js - Service for student tests
class StudentTestService {
    constructor() {
        this.baseURL = '/api/student/tests';
    }

    // Simulate network delay
    delay(ms = 800) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ----- Analytics (Mock) -----
    async getAnalyticsList() {
        await this.delay(500);
        // Mock list of tests/lessons with brief analytics summary
        const items = [
            { id: 'chem_midterm_inorganic', title: 'Giữa kỳ - Hóa vô cơ', type: 'test', totalStudents: 120, viewed: 108, completed: 92, avgScore: 7.8, attempts: 1.4 },
            { id: 'quiz_periodic_table', title: 'Quiz - Bảng tuần hoàn', type: 'quiz', totalStudents: 120, viewed: 112, completed: 105, avgScore: 8.3, attempts: 1.6 },
            { id: 'lesson_organic_reactions', title: 'Bài học - Phản ứng hữu cơ', type: 'lesson', totalStudents: 120, viewed: 98, completed: 74, avgScore: 7.1, attempts: 1.2 },
            { id: 'final_exam_overview', title: 'Cuối kỳ - Tổng hợp', type: 'test', totalStudents: 120, viewed: 120, completed: 118, avgScore: 7.5, attempts: 1.1 }
        ];
        return { success: true, data: items };
    }

    async getAnalyticsById(id) {
        await this.delay(500);
        // Mock per-item analytics data
        const catalog = {
            chem_midterm_inorganic: {
                id: 'chem_midterm_inorganic',
                type: 'test',
                title: 'Giữa kỳ - Hóa vô cơ',
                totalStudents: 120,
                viewed: 108,
                completed: 92,
                attempts: [ { x: 1, y: 92 }, { x: 2, y: 24 }, { x: 3, y: 6 } ],
                scores: [9.5, 8.0, 7.0, 6.5, 7.5, 8.5, 9.0, 5.0, 4.5, 6.0, 9.5, 10.0, 3.5, 8.2, 7.8, 6.9, 8.9, 9.3, 5.7, 6.1, 7.4, 8.6, 9.9, 4.8, 5.2, 6.8, 7.1, 8.0, 8.1, 7.2, 6.3, 5.9, 9.1, 9.4, 7.7, 8.8, 6.4, 5.6, 4.2, 3.9, 2.8, 9.0, 8.7, 7.6, 6.2, 5.1, 4.7, 7.9, 8.3, 9.2, 5.8, 6.7, 7.3, 8.4, 9.6 ]
            },
            quiz_periodic_table: {
                id: 'quiz_periodic_table',
                type: 'quiz',
                title: 'Quiz - Bảng tuần hoàn',
                totalStudents: 120,
                viewed: 112,
                completed: 105,
                attempts: [ { x: 1, y: 100 }, { x: 2, y: 45 }, { x: 3, y: 10 } ],
                scores: [8.5, 8.1, 8.0, 8.2, 7.9, 9.0, 8.7, 9.2, 8.9, 8.6, 7.5, 7.2, 7.8, 8.3, 8.8, 9.1, 8.4, 8.0, 7.6, 8.2]
            },
            lesson_organic_reactions: {
                id: 'lesson_organic_reactions',
                type: 'lesson',
                title: 'Bài học - Phản ứng hữu cơ',
                totalStudents: 120,
                viewed: 98,
                // Lessons should not track score/attempts
                attempts: [],
                scores: []
            },
            final_exam_overview: {
                id: 'final_exam_overview',
                type: 'test',
                title: 'Cuối kỳ - Tổng hợp',
                totalStudents: 120,
                viewed: 120,
                completed: 118,
                attempts: [ { x: 1, y: 118 }, { x: 2, y: 30 }, { x: 3, y: 8 } ],
                scores: [7.5, 7.4, 7.6, 7.5, 7.3, 7.7, 7.5, 7.8, 7.2, 7.1, 7.9, 8.0, 6.9, 6.8, 8.1]
            }
        };
        const item = catalog[id];
        if (!item) return { success: false, message: 'Not found' };
        return { success: true, data: item };
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
