using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}