// dashboardService.js - API service cho dashboard statistics
import api from './axios';
import { getCurrentTeacherId } from '../utils/getCurrentTeacherId';
import examService from './examService';
import examAttemptService from './examAttemptService';
import { questionBankService } from './questionBankService';
import examMatrixService from './examMatrixService';
import lessonPlanService from './lessonPlanService';

class DashboardService {
    constructor() {
        this.baseURL = '/api/dashboard';
    }

    // Get teacher dashboard statistics from real API
    async getTeacherStats() {
        try {
            // Get current teacher ID
            const teacherId = await getCurrentTeacherId();
            if (!teacherId) {
                throw new Error('Không tìm thấy thông tin giáo viên');
            }

            console.log('[DashboardService] Loading teacher stats for teacherId:', teacherId);

            // Load all data in parallel
            const [examsResult, questionBanksResult, examMatricesResult, lessonPlansResult] = await Promise.all([
                examService.getExams({ teacherId }),
                questionBankService.getQuestionBanks({ teacherId, page: 1, pageSize: 1000 }),
                examMatrixService.getAllExamMatrices({ teacherId }),
                lessonPlanService.getCurrentTeacherLessonPlans()
            ]);

            // Get all exams
            const exams = examsResult.success && examsResult.data ? examsResult.data : [];
            console.log('[DashboardService] Loaded exams:', exams.length);

            // Get all attempts for all exams
            const allAttemptsPromises = exams.map(exam => {
                const examId = exam.id || exam.Id;
                if (!examId) return Promise.resolve([]);
                return examAttemptService.getExamAttempts(examId).then(result => {
                    if (result.success && result.data) {
                        return result.data.map(attempt => ({
                            ...attempt,
                            examId: examId,
                            examTitle: exam.title || exam.Title
                        }));
                    }
                    return [];
                }).catch(err => {
                    console.error(`[DashboardService] Error loading attempts for exam ${examId}:`, err);
                    return [];
                });
            });

            const allAttemptsArrays = await Promise.all(allAttemptsPromises);
            const allAttempts = allAttemptsArrays.flat();
            console.log('[DashboardService] Loaded attempts:', allAttempts.length);

            // Calculate statistics from attempts
            // Status: 0 = InProgress, 1 = Submitted, 2 = Graded, 3 = Expired
            const submittedAttempts = allAttempts.filter(a => {
                const status = a.Status !== undefined ? a.Status : a.status;
                return status === 1 || status === 2; // Submitted or Graded
            });

            const inProgressAttempts = allAttempts.filter(a => {
                const status = a.Status !== undefined ? a.Status : a.status;
                return status === 0; // InProgress
            });

            // Calculate average score from submitted/graded attempts
            let avgTestScore = 0;
            if (submittedAttempts.length > 0) {
                const totalScore = submittedAttempts.reduce((sum, a) => {
                    const scorePercentage = a.ScorePercentage !== undefined && a.ScorePercentage !== null 
                        ? a.ScorePercentage 
                        : (a.scorePercentage !== undefined && a.scorePercentage !== null ? a.scorePercentage : 0);
                    // Convert percentage to scale of 10
                    return sum + (scorePercentage / 10);
                }, 0);
                avgTestScore = totalScore / submittedAttempts.length;
            }

            // Get unique students count
            const uniqueStudentIds = new Set();
            allAttempts.forEach(attempt => {
                const studentId = attempt.StudentId !== undefined ? attempt.StudentId : attempt.studentId;
                if (studentId) {
                    uniqueStudentIds.add(studentId);
                }
            });

            // Get question banks
            const questionBanks = questionBanksResult.success && questionBanksResult.data 
                ? (Array.isArray(questionBanksResult.data) ? questionBanksResult.data : (questionBanksResult.data.data || questionBanksResult.data.items || []))
                : [];

            // Count total questions from question banks
            let totalQuestions = 0;
            questionBanks.forEach(bank => {
                const count = bank.questionCount || bank.QuestionCount || bank.totalQuestions || bank.TotalQuestions || 0;
                totalQuestions += count;
            });

            // Get exam matrices
            const examMatrices = examMatricesResult.success && examMatricesResult.data 
                ? (Array.isArray(examMatricesResult.data) ? examMatricesResult.data : [])
                : [];

            // Get lesson plans
            const lessonPlans = lessonPlansResult.success && lessonPlansResult.data 
                ? (Array.isArray(lessonPlansResult.data) ? lessonPlansResult.data : (lessonPlansResult.data.data || lessonPlansResult.data.items || []))
                : [];

            // Count exams by status
            // StatusEnum: 0=Draft, 1=Inactive, 2=Active
            const publishedTests = exams.filter(e => {
                const status = e.statusEnum !== undefined ? e.statusEnum : (e.StatusEnum !== undefined ? e.StatusEnum : 0);
                return status === 2; // Active
            }).length;

            const draftTests = exams.filter(e => {
                const status = e.statusEnum !== undefined ? e.statusEnum : (e.StatusEnum !== undefined ? e.StatusEnum : 0);
                return status === 0; // Draft
            }).length;

            const stats = {
                totalLessonPlans: lessonPlans.length,
                totalQuestions: totalQuestions,
                totalTests: exams.length,
                totalStudents: uniqueStudentIds.size,
                publishedTests: publishedTests,
                draftTests: draftTests,
                avgTestScore: Math.round(avgTestScore * 10) / 10, // Round to 1 decimal
                completedTests: submittedAttempts.length,
                pendingTests: inProgressAttempts.length,
                recentActivity: [], // Will be populated separately if needed
                testStats: {
                    thisMonth: 0, // Can be calculated from attempts if needed
                    lastMonth: 0,
                    trend: 0
                },
                studentEngagement: {
                    avgCompletionRate: exams.length > 0 ? Math.round((submittedAttempts.length / (submittedAttempts.length + inProgressAttempts.length || 1)) * 100) : 0,
                    avgTimeSpent: 0, // Can be calculated from attempts if needed
                    activeStudents: uniqueStudentIds.size
                }
            };

            console.log('[DashboardService] Calculated stats:', stats);

            return {
                success: true,
                data: stats,
                message: 'Dashboard statistics loaded successfully'
            };
        } catch (error) {
            console.error('[DashboardService] Error loading teacher stats:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to load dashboard statistics'
            };
        }
    }

    // Get test completion statistics (can be enhanced later with real data)
    async getTestCompletionStats(period = 'week') {
        try {
            // For now, return empty data structure
            // This can be enhanced later to calculate from attempts data
            const chartData = {
                week: {
                    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                    completed: [0, 0, 0, 0, 0, 0, 0],
                    pending: [0, 0, 0, 0, 0, 0, 0]
                },
                month: {
                    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                    completed: [0, 0, 0, 0],
                    pending: [0, 0, 0, 0]
                }
            };

            return {
                success: true,
                data: chartData[period] || chartData.week,
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

    // Get recent student submissions from real API
    async getRecentSubmissions(limit = 5) {
        try {
            // Get current teacher ID
            const teacherId = await getCurrentTeacherId();
            if (!teacherId) {
                throw new Error('Không tìm thấy thông tin giáo viên');
            }

            console.log('[DashboardService] Loading recent submissions for teacherId:', teacherId);

            // Get all exams of teacher
            const examsResult = await examService.getExams({ teacherId });
            const exams = examsResult.success && examsResult.data ? examsResult.data : [];
            
            if (exams.length === 0) {
                return {
                    success: true,
                    data: [],
                    message: 'No recent submissions'
                };
            }

            // Get all attempts for all exams
            const allAttemptsPromises = exams.map(exam => {
                const examId = exam.id || exam.Id;
                if (!examId) return Promise.resolve([]);
                return examAttemptService.getExamAttempts(examId).then(result => {
                    if (result.success && result.data) {
                        return result.data.map(attempt => ({
                            ...attempt,
                            examId: examId,
                            examTitle: exam.title || exam.Title
                        }));
                    }
                    return [];
                }).catch(err => {
                    console.error(`[DashboardService] Error loading attempts for exam ${examId}:`, err);
                    return [];
                });
            });

            const allAttemptsArrays = await Promise.all(allAttemptsPromises);
            const allAttempts = allAttemptsArrays.flat();

            // Sort by submittedAt (most recent first)
            // Status: 0 = InProgress, 1 = Submitted, 2 = Graded, 3 = Expired
            const sortedAttempts = allAttempts
                .filter(a => {
                    const status = a.Status !== undefined ? a.Status : a.status;
                    // Only show Submitted (1) or Graded (2) attempts
                    return status === 1 || status === 2;
                })
                .sort((a, b) => {
                    const dateA = a.SubmittedAt || a.submittedAt || a.StartedAt || a.startedAt || '';
                    const dateB = b.SubmittedAt || b.submittedAt || b.StartedAt || b.startedAt || '';
                    return new Date(dateB) - new Date(dateA);
                })
                .slice(0, limit);

            // Map to submission format
            // Note: We need student name, but attempts only have StudentId
            // For now, we'll use StudentId, but ideally we should load student info
            const submissions = sortedAttempts.map(attempt => {
                const status = attempt.Status !== undefined ? attempt.Status : attempt.status;
                const scorePercentage = attempt.ScorePercentage !== undefined && attempt.ScorePercentage !== null 
                    ? attempt.ScorePercentage 
                    : (attempt.scorePercentage !== undefined && attempt.scorePercentage !== null ? attempt.scorePercentage : null);
                
                // Convert percentage to scale of 10
                const score = scorePercentage !== null ? Math.round((scorePercentage / 10) * 10) / 10 : null;
                
                const submittedAt = attempt.SubmittedAt || attempt.submittedAt || attempt.StartedAt || attempt.startedAt;
                
                return {
                    id: attempt.Id || attempt.id,
                    studentId: attempt.StudentId || attempt.studentId,
                    studentName: `Học sinh #${attempt.StudentId || attempt.studentId || 'N/A'}`, // Placeholder - should load from student service
                    testTitle: attempt.examTitle || 'Bài kiểm tra',
                    score: score,
                    submittedAt: submittedAt,
                    status: status === 2 ? 'graded' : (status === 1 ? 'submitted' : 'pending')
                };
            });

            console.log('[DashboardService] Recent submissions:', submissions);

            return {
                success: true,
                data: submissions,
                message: 'Recent submissions loaded successfully'
            };
        } catch (error) {
            console.error('[DashboardService] Error loading recent submissions:', error);
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
