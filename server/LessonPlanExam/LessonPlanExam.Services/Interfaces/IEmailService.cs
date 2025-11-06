namespace LessonPlanExam.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
    Task SendWelcomeEmailAsync(string toEmail, string userName);
    
    /// <summary>
    /// Gửi email chứa OTP để reset password
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="otp">Mã OTP 6 chữ số</param>
    /// <param name="userName">Tên người dùng</param>
    Task SendOtpResetPasswordEmailAsync(string toEmail, string otp, string userName);
}