using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Services.Mapping
{
    public static class LessonPlanMappers
    {
        #region DTO to Entity
        public static LessonPlan ToEntity(this CreateLessonPlanRequest request)
        {
            return new LessonPlan
            {
                Title = request.Title,
                CreatedByTeacher = request.CreatedByTeacher,
                Objectives = request.Objectives,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                GradeLevel = request.GradeLevel,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static void UpdateFromRequest(this LessonPlan entity, UpdateLessonPlanRequest request)
        {
            entity.Title = request.Title;
            entity.Objectives = request.Objectives;
            entity.Description = request.Description;
            entity.ImageUrl = request.ImageUrl;
            entity.GradeLevel = request.GradeLevel;
            entity.UpdatedAt = DateTime.UtcNow;
        }
        #endregion

        #region Entity to DTO
        public static LessonPlanResponse ToResponse(this LessonPlan entity)
        {
            return new LessonPlanResponse
            {
                Id = entity.Id,
                Title = entity.Title,
                CreatedByTeacher = entity.CreatedByTeacher,
                Objectives = entity.Objectives,
                Description = entity.Description,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                ImageUrl = entity.ImageUrl,
                GradeLevel = entity.GradeLevel,
                CreatedByTeacherName = entity.CreatedByTeacherNavigation?.Account?.FullName
            };
        }
        #endregion
    }
}