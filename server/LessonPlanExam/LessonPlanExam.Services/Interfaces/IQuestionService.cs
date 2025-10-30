using LessonPlanExam.Repositories.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using LessonPlanExam.Repositories.DTOs.QuestionDTOs;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<QuestionResponse> CreateAsync(QuestionCreateRequest request, CancellationToken ct = default);
        Task<IEnumerable<QuestionResponse>> QueryAsync(int? bankId, int? type, int? difficultyId, string domain, bool? active, string q, CancellationToken ct = default);
        Task<QuestionResponse> GetByIdAsync(int id, CancellationToken ct = default);
        Task<QuestionResponse> UpdateAsync(int id, QuestionUpdateRequest request, CancellationToken ct = default);
        Task<bool> SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task<bool> DeleteAsync(int id, CancellationToken ct = default);
        Task<int> BulkCreateAsync(BulkCreateQuestionsRequest request, CancellationToken ct = default);
        Task<object> PreviewAsync(int id, bool randomized, CancellationToken ct = default);
    }
}
