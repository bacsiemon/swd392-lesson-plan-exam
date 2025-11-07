using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.QuestionDifficultyDTOs;
using System.Threading.Tasks;
using System.Threading;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IQuestionDifficultyService
    {
        Task<BaseResponse<QuestionDifficultyResponse>> CreateAsync(CreateQuestionDifficultyRequest request);
        Task<BaseResponse<QuestionDifficultyResponse>> UpdateAsync(int id, UpdateQuestionDifficultyRequest request);
        Task<BaseResponse> DeleteAsync(int id);
        Task<BaseResponse<QuestionDifficultyResponse>> GetByIdAsync(int id);
        Task<BaseResponse> QueryAsync(string domain, int? difficultyLevel, int page, int size);
    }
}
