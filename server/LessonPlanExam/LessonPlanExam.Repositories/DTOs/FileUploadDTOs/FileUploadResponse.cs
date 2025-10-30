namespace LessonPlanExam.Repositories.DTOs.FileUploadDTOs
{
    public class FileUploadResponse
    {
        public int Id { get; set; }
        public string FileName { get; set; } = null!;
        public string MimeType { get; set; } = null!;
        public DateTime? UploadedAt { get; set; }
        public long FileSize { get; set; }
        public string FileUrl { get; set; } = null!;
    }
}