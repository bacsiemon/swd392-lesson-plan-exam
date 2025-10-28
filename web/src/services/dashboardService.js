// dashboardService.js - API service cho dashboard statistics
class DashboardService {
    constructor() {
        this.baseURL = '/api/dashboard';
    }

    // Simulate network delay
    delay(ms = 800) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get teacher dashboard statistics
    async getTeacherStats() {
        await this.delay(600);

        try {
            // Mock data - In production, replace with actual API call
            const mockStats = {
                totalLessonPlans: 45,
                totalQuestions: 328,
                totalTests: 23,
                totalStudents: 156,
                publishedTests: 18,
                draftTests: 5,
                avgTestScore: 7.8,
                completedTests: 342,
                pendingTests: 28,
                recentActivity: [
                    {
                        id: 1,
                        type: 'lesson',
                        title: 'Bài giảng: Phản ứng oxi hóa khử',
                        date: '2024-10-27',
                        status: 'published'
                    },
                    {
                        id: 2,
                        type: 'test',
                        title: 'Kiểm tra: Hóa học hữu cơ',
                        date: '2024-10-26',
                        status: 'active'
                    },
                    {
                        id: 3,
                        type: 'question',
                        title: 'Thêm 15 câu hỏi mới',
                        date: '2024-10-25',
                        status: 'completed'
                    }
                ],
                testStats: {
                    thisMonth: 8,
                    lastMonth: 12,
                    trend: -33 // percentage change
                },
                studentEngagement: {
                    avgCompletionRate: 85,
                    avgTimeSpent: 25, // minutes
                    activeStudents: 142
                }
            };

            return {
                success: true,
                data: mockStats,
                message: 'Dashboard statistics loaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to load dashboard statistics'
            };
        }
    }

    // Get test completion statistics
    async getTestCompletionStats(period = 'week') {
        await this.delay(500);

        try {
            // Mock data for chart
            const mockChartData = {
                week: {
                    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                    completed: [12, 19, 15, 22, 18, 25, 20],
                    pending: [5, 3, 4, 2, 3, 1, 2]
                },
                month: {
                    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                    completed: [45, 52, 48, 55],
                    pending: [8, 6, 7, 5]
                }
            };

            return {
                success: true,
                data: mockChartData[period] || mockChartData.week,
                message: 'Test completion stats loaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to load test completion statistics'
            };
        }
    }

    // Get recent student submissions
    async getRecentSubmissions(limit = 5) {
        await this.delay(400);

        try {
            const mockSubmissions = [
                {
                    id: 1,
                    studentName: 'Nguyễn Văn A',
                    testTitle: 'Kiểm tra giữa kỳ - Hóa vô cơ',
                    score: 8.5,
                    submittedAt: '2024-10-27 14:30',
                    status: 'graded'
                },
                {
                    id: 2,
                    studentName: 'Trần Thị B',
                    testTitle: 'Bài tập Hóa hữu cơ',
                    score: 9.0,
                    submittedAt: '2024-10-27 13:15',
                    status: 'graded'
                },
                {
                    id: 3,
                    studentName: 'Lê Văn C',
                    testTitle: 'Quiz nhanh - Bảng tuần hoàn',
                    score: 7.5,
                    submittedAt: '2024-10-27 11:20',
                    status: 'graded'
                },
                {
                    id: 4,
                    studentName: 'Phạm Thị D',
                    testTitle: 'Kiểm tra 15 phút',
                    score: null,
                    submittedAt: '2024-10-27 10:00',
                    status: 'pending'
                },
                {
                    id: 5,
                    studentName: 'Hoàng Văn E',
                    testTitle: 'Bài tập về nhà',
                    score: 8.0,
                    submittedAt: '2024-10-26 16:45',
                    status: 'graded'
                }
            ];

            return {
                success: true,
                data: mockSubmissions.slice(0, limit),
                message: 'Recent submissions loaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to load recent submissions'
            };
        }
    }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
