// studentDashboardService.js - Service for student dashboard statistics
import api from './axios';
import examService from './examService';
import examAttemptService from './examAttemptService';

class StudentDashboardService {
  /**
   * Get student statistics from real API
   * This will fetch all exams and attempts for the current student
   */
  async getStudentStats() {
    try {
      console.log('[StudentDashboardService] Loading student stats...');

      // Get all available exams
      const examsResult = await examService.getExams({});
      if (!examsResult.success || !examsResult.data) {
        console.warn('[StudentDashboardService] Failed to load exams');
        return {
          success: false,
          stats: this.getDefaultStats(),
          message: 'Không thể tải thống kê'
        };
      }

      const exams = Array.isArray(examsResult.data) ? examsResult.data : [];
      console.log('[StudentDashboardService] Loaded exams:', exams.length);

      // Get all attempts for all exams
      const allAttemptsPromises = exams.map(exam => {
        const examId = exam.id || exam.Id;
        if (!examId) return Promise.resolve([]);
        return examAttemptService.getExamAttempts(examId).then(result => {
          if (result.success && result.data) {
            // Filter attempts by current student
            // Attempts have StudentId field
            return result.data.map(attempt => ({
              ...attempt,
              examId: examId,
              examTitle: exam.title || exam.Title
            }));
          }
          return [];
        }).catch(err => {
          console.error(`[StudentDashboardService] Error loading attempts for exam ${examId}:`, err);
          return [];
        });
      });

      const allAttemptsArrays = await Promise.all(allAttemptsPromises);
      const allAttempts = allAttemptsArrays.flat();
      console.log('[StudentDashboardService] Loaded attempts:', allAttempts.length);

      // Get current student ID from token
      let currentStudentId = null;
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          currentStudentId = decoded.userId || decoded.sub || 
                           decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                           decoded.id;
          if (currentStudentId) {
            currentStudentId = parseInt(currentStudentId);
          }
        }
      } catch (error) {
        console.error('[StudentDashboardService] Error decoding token:', error);
      }

      if (!currentStudentId) {
        console.warn('[StudentDashboardService] Cannot determine current student ID');
        return {
          success: false,
          stats: this.getDefaultStats(),
          message: 'Không thể xác định học sinh hiện tại'
        };
      }

      // Filter attempts by current student
      const myAttempts = allAttempts.filter(attempt => {
        const studentId = attempt.StudentId !== undefined ? attempt.StudentId : attempt.studentId;
        const studentIdNum = typeof studentId === 'string' ? parseInt(studentId) : studentId;
        return studentIdNum === currentStudentId;
      });
      console.log('[StudentDashboardService] My attempts:', myAttempts.length);

      // Calculate statistics
      // Status: 0 = InProgress, 1 = Submitted, 2 = Graded, 3 = Expired
      const submittedAttempts = myAttempts.filter(attempt => {
        const status = attempt.Status !== undefined ? attempt.Status : attempt.status;
        const submittedAt = attempt.SubmittedAt !== undefined ? attempt.SubmittedAt : attempt.submittedAt;
        return (status === 1 || status === 2) || (submittedAt !== null && submittedAt !== undefined);
      });

      const gradedAttempts = myAttempts.filter(attempt => {
        const status = attempt.Status !== undefined ? attempt.Status : attempt.status;
        return status === 2; // Graded
      });

      // Calculate average score from graded attempts
      let averageScore = 0;
      if (gradedAttempts.length > 0) {
        const totalScore = gradedAttempts.reduce((sum, attempt) => {
          const scorePercentage = attempt.ScorePercentage !== undefined 
            ? attempt.ScorePercentage 
            : (attempt.scorePercentage !== undefined ? attempt.scorePercentage : 0);
          return sum + (scorePercentage || 0);
        }, 0);
        averageScore = Math.round(totalScore / gradedAttempts.length);
      }

      // Get unique exams that student has attempted
      const attemptedExams = new Set();
      myAttempts.forEach(attempt => {
        const examId = attempt.ExamId !== undefined ? attempt.ExamId : attempt.examId;
        if (examId) {
          attemptedExams.add(examId);
        }
      });

      // Get recent attempts (last 5, sorted by SubmittedAt or StartedAt)
      const recentAttempts = myAttempts
        .filter(attempt => {
          const submittedAt = attempt.SubmittedAt !== undefined ? attempt.SubmittedAt : attempt.submittedAt;
          return submittedAt !== null && submittedAt !== undefined;
        })
        .sort((a, b) => {
          const dateA = new Date(a.SubmittedAt || a.submittedAt || a.StartedAt || a.startedAt || 0);
          const dateB = new Date(b.SubmittedAt || b.submittedAt || b.StartedAt || b.startedAt || 0);
          return dateB - dateA;
        })
        .slice(0, 5);

      const stats = {
        totalExams: attemptedExams.size,
        completedExams: submittedAttempts.length,
        averageScore: averageScore,
        totalAttempts: myAttempts.length,
        submittedAttempts: submittedAttempts.length,
        gradedAttempts: gradedAttempts.length,
        recentAttempts: recentAttempts
      };

      console.log('[StudentDashboardService] Calculated stats:', stats);

      return {
        success: true,
        stats: stats,
        message: 'Lấy thống kê thành công'
      };
    } catch (error) {
      console.error('[StudentDashboardService] Error loading student stats:', error);
      return {
        success: false,
        stats: this.getDefaultStats(),
        message: 'Có lỗi xảy ra khi tải thống kê'
      };
    }
  }

  getDefaultStats() {
    return {
      totalExams: 0,
      completedExams: 0,
      averageScore: 0,
      totalAttempts: 0,
      submittedAttempts: 0,
      gradedAttempts: 0,
      recentAttempts: []
    };
  }
}

// Export singleton instance
const studentDashboardService = new StudentDashboardService();
export default studentDashboardService;

