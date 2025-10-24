using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;

namespace LessonPlanExam.Services.Interfaces
{
    public interface ILessonPlanService
    {
        Task<BaseResponse> CreateLessonPlanAsync(CreateLessonPlanRequest request);
        Task<BaseResponse> UpdateLessonPlanAsync(int id, UpdateLessonPlanRequest request);
        Task<BaseResponse> DeleteLessonPlanAsync(int id);
        Task<BaseResponse> GetLessonPlanByIdAsync(int id);
        Task<BaseResponse> GetByCurrentTeacherAsync(int page, int size);
    }
}