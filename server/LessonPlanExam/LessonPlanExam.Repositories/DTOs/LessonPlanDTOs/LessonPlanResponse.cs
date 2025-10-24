namespace LessonPlanExam.Repositories.DTOs.LessonPlanDTOs
{
    public class LessonPlanResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public int CreatedByTeacher { get; set; }
        public string Objectives { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? ImageUrl { get; set; }
        public int GradeLevel { get; set; }
        public string? CreatedByTeacherName { get; set; }
    }
}