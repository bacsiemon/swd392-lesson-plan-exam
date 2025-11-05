using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

/// <summary>
/// Request để gửi OTP reset password qua email
/// </summary>
public class ForgotPasswordWithOtpRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}
