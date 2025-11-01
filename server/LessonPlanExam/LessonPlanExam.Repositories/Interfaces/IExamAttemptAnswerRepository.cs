using LessonPlanExam.Repositories.Models;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IExamAttemptAnswerRepository
    {
        Task<ExamAttemptAnswer> SaveAnswerAsync(ExamAttemptAnswer answer, CancellationToken ct = default);
        Task<ExamAttemptAnswer> GetAnswerAsync(int attemptId, int questionId, CancellationToken ct = default);
    }
}
