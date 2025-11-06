namespace LessonPlanExam.Repositories.DTOs.SlotPlanDTOs
{
    public class SlotPlanResponse
    {
        public int Id { get; set; }
        public int LessonPlanId { get; set; }
        public int SlotNumber { get; set; }
        public string Title { get; set; } = null!;
        public int? DurationMinutes { get; set; }
        public string Content { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string LessonPlanTitle { get; set; } = null!;
    }
}