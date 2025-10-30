using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

public class LoginResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public EUserRole Role { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime TokenExpiry { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }
}