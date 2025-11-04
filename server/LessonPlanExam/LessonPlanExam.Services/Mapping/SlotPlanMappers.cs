using LessonPlanExam.Repositories.DTOs.SlotPlanDTOs;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Services.Mapping
{
    public static class SlotPlanMappers
    {
        #region DTO to Entity
        public static SlotPlan ToEntity(this CreateSlotPlanRequest request)
        {
            return new SlotPlan
            {
                LessonPlanId = request.LessonPlanId,
                SlotNumber = request.SlotNumber,
                Title = request.Title,
                DurationMinutes = request.DurationMinutes,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
        #endregion

        #region Entity to DTO
        public static SlotPlanResponse ToResponse(this SlotPlan entity)
        {
            return new SlotPlanResponse
            {
                Id = entity.Id,
                LessonPlanId = entity.LessonPlanId,
                SlotNumber = entity.SlotNumber,
                Title = entity.Title,
                DurationMinutes = entity.DurationMinutes,
                Content = entity.Content,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                LessonPlanTitle = entity.LessonPlan?.Title ?? string.Empty
            };
        }
        #endregion
    }
}