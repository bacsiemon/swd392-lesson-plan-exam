using LessonPlanExam.Repositories.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading;
using LessonPlanExam.Repositories.DTOs.QuestionDTOs;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IQuestionRepository : Base.IGenericRepository<Question>
    {
        Task<Question> CreateQuestionAsync(QuestionCreateRequest request, CancellationToken ct = default);
        Task<IEnumerable<Question>> QueryAsync(int? bankId, int? type, int? difficultyId, bool? active, string q, CancellationToken ct = default);
        Task<Question> UpdateQuestionAsync(int id, QuestionUpdateRequest request, CancellationToken ct = default);
        Task<bool> SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task<bool> DeleteQuestionAsync(int id, CancellationToken ct = default);
        Task<int> BulkCreateAsync(BulkCreateQuestionsRequest request, CancellationToken ct = default);
        Task<Question> GetWithAnswersAsync(int id, CancellationToken ct = default);
        Task<object> PreviewAsync(int id, bool randomized, CancellationToken ct = default);
    }
}
