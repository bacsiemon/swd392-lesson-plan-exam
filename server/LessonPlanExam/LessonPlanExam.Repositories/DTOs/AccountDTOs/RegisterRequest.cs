using System.ComponentModel.DataAnnotations;
using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d\W]{6,}$", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("Password", ErrorMessage = "Password and confirm password do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Full name is required")]
    [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Role is required")]
    public EUserRole Role { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? PhoneNumber { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [StringLength(500, ErrorMessage = "Bio cannot exceed 500 characters")]
    public string? Bio { get; set; }
}