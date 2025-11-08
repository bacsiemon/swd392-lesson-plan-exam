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
                Objectives = request.Objectives,
                EquipmentNeeded = request.EquipmentNeeded,
                Preparations = request.Preparations,
                Activities = request.Activities,
                ReviseQuestions = request.ReviseQuestions,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static void UpdateFromRequest(this SlotPlan entity, UpdateSlotPlanRequest request)
        {
            entity.Title = request.Title;
            entity.DurationMinutes = request.DurationMinutes;
            entity.Objectives = request.Objectives;
            entity.EquipmentNeeded = request.EquipmentNeeded;
            entity.Preparations = request.Preparations;
            entity.Activities = request.Activities;
            entity.ReviseQuestions = request.ReviseQuestions;
            entity.UpdatedAt = DateTime.UtcNow;
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
                Objectives = entity.Objectives,
                EquipmentNeeded = entity.EquipmentNeeded,
                Preparations = entity.Preparations,
                Activities = entity.Activities,
                ReviseQuestions = entity.ReviseQuestions,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                LessonPlanTitle = entity.LessonPlan?.Title ?? string.Empty
            };
        }
        #endregion
    }
}