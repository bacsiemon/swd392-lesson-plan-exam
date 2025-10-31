namespace LessonPlanExam.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
    Task SendWelcomeEmailAsync(string toEmail, string userName);
}