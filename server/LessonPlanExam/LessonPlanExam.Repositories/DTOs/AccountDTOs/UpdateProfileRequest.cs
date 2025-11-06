using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs;

/// <summary>
/// DTO cho request cập nhật thông tin profile của user hiện tại
/// Cho phép user thay đổi tên, số điện thoại, avatar, bio
/// Không cho phép thay đổi email (cần API riêng để đảm bảo bảo mật)
/// </summary>
public class UpdateProfileRequest
{
    /// <summary>
    /// Tên đầy đủ của người dùng
    /// </summary>
    [StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự")]
    public string? FullName { get; set; }

    /// <summary>
    /// Số điện thoại liên hệ
    /// </summary>
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
    public string? Phone { get; set; }

    /// <summary>
    /// URL của ảnh đại diện
    /// </summary>
    [Url(ErrorMessage = "URL ảnh đại diện không hợp lệ")]
    [StringLength(500, ErrorMessage = "URL không được vượt quá 500 ký tự")]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Ngày sinh (optional)
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    // Note: Bio field chưa có trong database
    // Nếu muốn thêm Bio, cần tạo migration để thêm column vào bảng accounts
}
