using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Reset token is required")]
    public string ResetToken { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d\W]{6,}$", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("NewPassword", ErrorMessage = "Password and confirm password do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}