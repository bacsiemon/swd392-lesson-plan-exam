using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.SlotPlanDTOs;

namespace LessonPlanExam.Services.Interfaces
{
    public interface ISlotPlanService
    {
        Task<BaseResponse> CreateSlotPlanAsync(CreateSlotPlanRequest request);
    }
}