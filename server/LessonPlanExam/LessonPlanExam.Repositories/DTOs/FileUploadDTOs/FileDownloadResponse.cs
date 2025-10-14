namespace LessonPlanExam.Repositories.DTOs.FileUploadDTOs
{
    public class FileDownloadResponse
    {
        public string FileName { get; set; } = null!;
        public string MimeType { get; set; } = null!;
        public byte[] Data { get; set; } = null!;
    }
}