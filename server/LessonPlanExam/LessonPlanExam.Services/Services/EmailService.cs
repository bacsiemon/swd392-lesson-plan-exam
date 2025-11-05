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
                EnableSsl = true,
                UseDefaultCredentials = false, // Quan trọng: phải set false TRƯỚC khi set Credentials
                Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.SenderPassword),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 30000 // 30 giây timeout
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
            // Log the exception với chi tiết để debug
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

    public async Task SendOtpResetPasswordEmailAsync(string toEmail, string otp, string userName)
    {
        var subject = "Mã OTP Đặt Lại Mật Khẩu - Lesson Plan Exam System";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;'>
                    <div style='background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                        <h2 style='color: white; margin: 0;'>🔐 Đặt Lại Mật Khẩu</h2>
                    </div>
                    <div style='background-color: white; padding: 30px; border-radius: 0 0 10px 10px;'>
                        <p style='font-size: 16px;'>Xin chào <strong>{userName}</strong>,</p>
                        <p style='font-size: 14px; color: #555;'>
                            Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Lesson Plan Exam System của mình.
                        </p>
                        <div style='background-color: #f0f0f0; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>Mã OTP của bạn là:</p>
                            <h1 style='color: #4CAF50; font-size: 36px; letter-spacing: 8px; margin: 10px 0; font-family: monospace;'>{otp}</h1>
                            <p style='margin: 0; font-size: 12px; color: #999;'>Mã này có hiệu lực trong <strong>5 phút</strong></p>
                        </div>
                        <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;'>
                            <p style='margin: 0; font-size: 13px; color: #856404;'>
                                <strong>⚠️ Lưu ý bảo mật:</strong><br/>
                                • Không chia sẻ mã OTP này với bất kỳ ai<br/>
                                • Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này<br/>
                                • Mã OTP sẽ tự động hết hạn sau 5 phút
                            </p>
                        </div>
                        <p style='font-size: 14px; color: #555;'>
                            Để hoàn tất việc đặt lại mật khẩu, vui lòng nhập mã OTP này vào form đặt lại mật khẩu trên website.
                        </p>
                        <hr style='margin: 25px 0; border: none; border-top: 1px solid #ddd;'>
                        <p style='color: #999; font-size: 12px; text-align: center; margin: 0;'>
                            Email tự động từ <strong>Lesson Plan Exam System</strong><br/>
                            Vui lòng không trả lời email này
                        </p>
                    </div>
                </div>
            </body>
            </html>";

        await SendEmailAsync(toEmail, subject, body);
    }
}