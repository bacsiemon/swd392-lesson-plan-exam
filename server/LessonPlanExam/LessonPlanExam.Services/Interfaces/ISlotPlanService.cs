using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.SlotPlanDTOs;

namespace LessonPlanExam.Services.Interfaces
{
    public interface ISlotPlanService
    {
        Task<BaseResponse> CreateSlotPlanAsync(CreateSlotPlanRequest request);
        Task<BaseResponse> UpdateSlotPlanAsync(int id, UpdateSlotPlanRequest request);
        Task<BaseResponse> DeleteSlotPlanAsync(int id);
        Task<BaseResponse> GetSlotPlansByLessonPlanAsync(int lessonPlanId, int page = 1, int size = 10);
        Task<BaseResponse> GetLessonPlanWithSlotPlansAsync(int lessonPlanId);
    }
}