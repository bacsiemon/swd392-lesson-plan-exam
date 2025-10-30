using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace LessonPlanExam.Services.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;

    public EmailService(IOptions<EmailSettings> emailSettings)
    {
        _emailSettings = emailSettings.Value;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
            {
                Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.SenderPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            // Log the exception
            throw new Exception($"Failed to send email: {ex.Message}", ex);
        }
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName)
    {
        var subject = "Password Reset Request - Lesson Plan Exam System";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #333;'>Password Reset Request</h2>
                    <p>Dear {userName},</p>
                    <p>You have requested to reset your password for the Lesson Plan Exam System.</p>
                    <p>Your password reset token is: <strong style='background-color: #f5f5f5; padding: 5px; border-radius: 3px;'>{resetToken}</strong></p>
                    <p>This token will expire in 15 minutes for security reasons.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                    <hr style='margin: 20px 0;'>
                    <p style='color: #666; font-size: 12px;'>
                        This is an automated email from the Lesson Plan Exam System. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string userName)
    {
        var subject = "Welcome to Lesson Plan Exam System";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #333;'>Welcome to Lesson Plan Exam System!</h2>
                    <p>Dear {userName},</p>
                    <p>Thank you for registering with our Lesson Plan Exam System.</p>
                    <p>Your account has been successfully created and you can now start using our platform.</p>
                    <p>Features available to you:</p>
                    <ul>
                        <li>Create and manage lesson plans</li>
                        <li>Take exams and assessments</li>
                        <li>Track your progress</li>
                        <li>Access learning materials</li>
                    </ul>
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                    <hr style='margin: 20px 0;'>
                    <p style='color: #666; font-size: 12px;'>
                        This is an automated email from the Lesson Plan Exam System. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(toEmail, subject, body);
    }
}