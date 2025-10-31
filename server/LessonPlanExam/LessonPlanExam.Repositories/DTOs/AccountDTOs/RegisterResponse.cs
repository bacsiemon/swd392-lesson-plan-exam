namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

public class RegisterResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}