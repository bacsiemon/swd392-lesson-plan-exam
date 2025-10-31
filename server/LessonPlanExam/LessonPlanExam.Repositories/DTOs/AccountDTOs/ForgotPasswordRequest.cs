using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}