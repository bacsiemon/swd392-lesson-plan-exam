using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Services.Interfaces
{
    /// <summary>
    /// Service for generating documents from lesson plans and slot plans
    /// </summary>
    public interface ILessonPlanFileGenerationService
    {
        /// <summary>
        /// Generates a Word document (.docx) for a lesson plan with its slot plans
        /// </summary>
        /// <param name="lessonPlan">The lesson plan entity with slot plans included</param>
        /// <returns>Byte array containing the Word document</returns>
        Task<byte[]> GenerateWordDocumentAsync(LessonPlan lessonPlan);
    }
}