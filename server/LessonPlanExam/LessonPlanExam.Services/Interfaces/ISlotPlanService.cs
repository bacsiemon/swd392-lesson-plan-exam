using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.SlotPlanDTOs;

namespace LessonPlanExam.Services.Interfaces
{
    public interface ISlotPlanService
    {
        Task<BaseResponse> CreateSlotPlanAsync(CreateSlotPlanRequest request);
        Task<BaseResponse> UpdateSlotPlanAsync(int id, UpdateSlotPlanRequest request);
    }
}