using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Services.Interfaces
{
    public interface ILessonPlanAiGenerationService
    {
        /// <summary>Teacher</summary>
        /// <remarks>
        /// Generate a lesson plan with multiple slot plans using AI (Gemini 2.5 Pro).
        /// 
        /// Parameters:
        /// prompt: Required, Vietnamese prompt describing the lesson content, minimum 10 characters, maximum 2000 characters.
        /// gradeLevel: Required, grade level from 1 to 12.
        /// numberOfSlots: Optional, number of slots to generate (default: 3, max: 10).
        /// durationMinutesPerSlot: Optional, duration in minutes for each slot (default: 45, max: 240).
        /// 
        /// Sample request:
        /// ```
        /// POST /api/lesson-plans/generate-ai
        /// {
        ///   "prompt": "T?o bài h?c v? phép c?ng và phép tr? trong toán h?c cho h?c sinh l?p 2",
        ///   "gradeLevel": 2,
        ///   "numberOfSlots": 3,
        ///   "durationMinutesPerSlot": 45
        /// }
        /// ```
        /// </remarks>
        /// <response code="201">Lesson plan generated successfully</response>
        /// <response code="400">Validation error. Possible messages:
        /// - PROMPT_REQUIRED
        /// - PROMPT_MIN_10_CHARACTERS
        /// - PROMPT_MAX_2000_CHARACTERS
        /// - GRADE_LEVEL_MUST_BE_GREATER_THAN_ZERO
        /// - GRADE_LEVEL_MAX_12
        /// - NUMBER_OF_SLOTS_MUST_BE_GREATER_THAN_ZERO
        /// - NUMBER_OF_SLOTS_MAX_10
        /// - DURATION_MINUTES_PER_SLOT_MUST_BE_GREATER_THAN_ZERO
        /// - DURATION_MINUTES_PER_SLOT_MAX_240
        /// </response>
        /// <response code="401">Unauthorized access</response>
        /// <response code="500">AI_GENERATION_FAILED</response>
        Task<BaseResponse<LessonPlan>> GenerateLessonPlanAsync(GenerateLessonPlanAiRequest request);
    }
}