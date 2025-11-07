using LessonPlanExam.Repositories.DTOs.QuestionDifficultyDTOs;
using LessonPlanExam.Repositories.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IQuestionDifficultyRepository
    {
        Task<QuestionDifficulty> CreateAsync(CreateQuestionDifficultyRequest request, CancellationToken ct = default);
        Task<QuestionDifficulty> UpdateAsync(int id, UpdateQuestionDifficultyRequest request, CancellationToken ct = default);
        Task<bool> DeleteAsync(int id, CancellationToken ct = default);
        Task<QuestionDifficulty> GetByIdAsync(int id, CancellationToken ct = default);
        Task<(IEnumerable<QuestionDifficultyListItem> Items, int TotalCount)> QueryAsync(string domain, int? difficultyLevel, int page, int size, CancellationToken ct = default);
    }
}
