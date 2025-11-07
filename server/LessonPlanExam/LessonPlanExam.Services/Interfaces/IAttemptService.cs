using LessonPlanExam.Repositories.DTOs.AttemptDTOs;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IAttemptService
    {
        Task<AttemptStartResponse> StartAttemptAsync(int examId, int studentId, string password, CancellationToken ct = default);
        Task<SaveAnswerResult> SaveAnswerAsync(int examId, int attemptId, SaveAnswerRequest request, CancellationToken ct = default);
        Task<SubmitResponse> SubmitAttemptAsync(int examId, int attemptId, CancellationToken ct = default);
        Task<SubmitResponse> GetAttemptResultAsync(int examId, int attemptId, int studentId, CancellationToken ct = default);
    }
}
