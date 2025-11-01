using LessonPlanExam.Repositories.Models;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IExamAttemptRepository
    {
        Task<ExamAttempt> CreateAttemptAsync(ExamAttempt attempt, CancellationToken ct = default);
        Task<ExamAttempt> GetAttemptWithAnswersAsync(int attemptId, CancellationToken ct = default);
        Task<IEnumerable<ExamAttempt>> QueryAttemptsByExamAsync(int examId, int? status, CancellationToken ct = default);
        Task<int> GetAttemptCountForStudentAsync(int examId, int studentId, CancellationToken ct = default);
    }
}
