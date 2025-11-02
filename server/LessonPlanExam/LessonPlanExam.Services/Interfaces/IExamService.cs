using LessonPlanExam.Repositories.DTOs.ExamDTOs;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IExamService
    {
        Task<ExamResponse> CreateAsync(ExamCreateRequest request, CancellationToken ct = default);
        Task<ExamResponse> CreateFromMatrixAsync(ExamFromMatrixRequest request, CancellationToken ct = default);
        Task<IEnumerable<ExamResponse>> QueryAsync(int? teacherId, LessonPlanExam.Repositories.Enums.EExamStatus? status, string q, CancellationToken ct = default);
        Task<ExamResponse> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ExamResponse> UpdateAsync(int id, ExamUpdateRequest request, CancellationToken ct = default);
        Task<bool> UpdateStatusAsync(int id, LessonPlanExam.Repositories.Enums.EExamStatus status, CancellationToken ct = default);
        Task<Repositories.DTOs.ExamDTOs.ExamQuestionResponse> AddQuestionAsync(int examId, ExamQuestionAddRequest request, CancellationToken ct = default);
        Task<IEnumerable<Repositories.DTOs.ExamDTOs.ExamQuestionResponse>> GetQuestionsAsync(int examId, CancellationToken ct = default);
        Task<Repositories.DTOs.ExamDTOs.ExamQuestionResponse> UpdateQuestionAsync(int examQuestionId, ExamQuestionAddRequest request, CancellationToken ct = default);
        Task<bool> DeleteQuestionAsync(int examQuestionId, CancellationToken ct = default);
        Task<PreviewRandomResponse> PreviewRandomAsync(int matrixId, decimal? totalPoints, CancellationToken ct = default);
        Task<AccessCheckResponse> CheckAccessAsync(int examId, int? studentId, string password, CancellationToken ct = default);
    }
}
