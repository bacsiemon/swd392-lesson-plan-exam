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
        var subject = "🧪 Mã OTP Đặt Lại Mật Khẩu - Chemistry Learning Platform";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap');
        
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Roboto', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        
        .molecule {{
            position: absolute;
            border-radius: 50%;
            opacity: 0.6;
            animation: float 3s ease-in-out infinite;
        }}
        
        @keyframes float {{
            0%, 100% {{ transform: translateY(0px) rotate(0deg); }}
            50% {{ transform: translateY(-20px) rotate(180deg); }}
        }}
        
        @keyframes glow {{
            0%, 100% {{ box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); }}
            50% {{ box-shadow: 0 0 40px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.6); }}
        }}
        
        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.05); }}
        }}
    </style>
</head>
<body style='margin: 0; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;'>
    <div style='max-width: 650px; margin: 0 auto; position: relative;'>
        
        <!-- Floating molecules decoration -->
        <div style='position: absolute; top: -30px; left: 20px; width: 60px; height: 60px; background: radial-gradient(circle, #00ffff 0%, #0080ff 100%); border-radius: 50%; opacity: 0.4; animation: float 3s ease-in-out infinite;'></div>
        <div style='position: absolute; top: 50px; right: 30px; width: 40px; height: 40px; background: radial-gradient(circle, #ff6b6b 0%, #ff0000 100%); border-radius: 50%; opacity: 0.4; animation: float 4s ease-in-out infinite;'></div>
        <div style='position: absolute; bottom: 100px; left: -20px; width: 50px; height: 50px; background: radial-gradient(circle, #51cf66 0%, #00ff00 100%); border-radius: 50%; opacity: 0.4; animation: float 3.5s ease-in-out infinite;'></div>
        
        <!-- Main container -->
        <div style='background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);'>
            
            <!-- Header with chemical theme -->
            <div style='background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;'>
                <!-- Animated beaker icon -->
                <div style='display: inline-block; margin-bottom: 15px;'>
                    <div style='font-size: 64px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));'>🧪</div>
                </div>
                <h1 style='color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-family: ""Orbitron"", sans-serif;'>
                    MÃ BẢO MẬT OTP
                </h1>
                <p style='color: #e0e0e0; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 1px;'>
                    CHEMISTRY LEARNING PLATFORM
                </p>
                
                <!-- Chemical formula decoration -->
                <div style='position: absolute; top: 10px; left: 20px; font-size: 18px; opacity: 0.3; color: white; font-family: monospace;'>
                    H₂O • CO₂
                </div>
                <div style='position: absolute; bottom: 10px; right: 20px; font-size: 18px; opacity: 0.3; color: white; font-family: monospace;'>
                    NaCl • CH₄
                </div>
            </div>
            
            <!-- Content area -->
            <div style='padding: 40px 30px;'>
                
                <!-- Greeting -->
                <div style='text-align: center; margin-bottom: 30px;'>
                    <p style='font-size: 18px; color: #2c3e50; margin: 0;'>
                        Xin chào, <strong style='color: #667eea; font-size: 20px;'>{userName}</strong> ⚗️
                    </p>
                </div>
                
                <!-- Info text -->
                <p style='font-size: 15px; color: #555; text-align: center; line-height: 1.6; margin: 0 0 35px 0;'>
                    Bạn đã khởi động <strong style='color: #764ba2;'>phản ứng đặt lại mật khẩu</strong>!<br/>
                    Sử dụng mã OTP bên dưới để hoàn tất <strong>phản ứng hóa học</strong> này.
                </p>
                
                <!-- OTP Display - Chemical Flask Style -->
                <div style='background: linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border: 3px dashed #667eea; border-radius: 20px; padding: 35px 20px; margin: 30px 0; position: relative; text-align: center;'>
                    
                    <!-- Top flask opening -->
                    <div style='position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: white; padding: 0 20px; font-size: 28px;'>
                        ⚗️
                    </div>
                    
                    <p style='margin: 0 0 15px 0; font-size: 14px; color: #667eea; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;'>
                        🔬 Mã Phản Ứng OTP
                    </p>
                    
                    <!-- OTP Code -->
                    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; padding: 25px; margin: 20px auto; max-width: 280px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); animation: pulse 2s ease-in-out infinite;'>
                        <div style='font-family: ""Orbitron"", monospace; font-size: 48px; font-weight: 700; color: #ffffff; letter-spacing: 12px; text-shadow: 0 4px 8px rgba(0,0,0,0.2); line-height: 1;'>
                            {otp}
                        </div>
                    </div>
                    
                    <!-- Timer -->
                    <div style='background: rgba(255, 193, 7, 0.15); border: 2px solid #ffc107; border-radius: 25px; padding: 12px 25px; display: inline-block; margin-top: 15px;'>
                        <span style='font-size: 13px; color: #f57c00; font-weight: 600;'>
                            ⏱️ Thời gian phản ứng: <strong style='font-size: 15px;'>5 phút</strong>
                        </span>
                    </div>
                    
                    <!-- Chemical bonds decoration -->
                    <div style='position: absolute; bottom: 10px; left: 20px; font-size: 24px; opacity: 0.2;'>⚛️</div>
                    <div style='position: absolute; bottom: 10px; right: 20px; font-size: 24px; opacity: 0.2;'>🧬</div>
                </div>
                
                <!-- Periodic Table Style Warning -->
                <div style='background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); border-radius: 15px; padding: 25px; margin: 30px 0; color: white; box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);'>
                    <div style='display: flex; align-items: center;'>
                        <div style='font-size: 40px; margin-right: 20px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));'>⚠️</div>
                        <div style='flex: 1;'>
                            <h3 style='margin: 0 0 12px 0; font-size: 16px; font-weight: 700;'>⚗️ Lưu Ý An Toàn Phòng Thí Nghiệm</h3>
                            <ul style='margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; list-style: none;'>
                                <li style='margin-bottom: 8px;'>🔒 <strong>TUYỆT ĐỐI</strong> không chia sẻ mã OTP với bất kỳ ai</li>
                                <li style='margin-bottom: 8px;'>⏰ Mã có hiệu lực trong <strong>5 phút</strong> - giống như phản ứng hóa học cần thời gian chính xác</li>
                                <li style='margin-bottom: 0;'>🧪 Nếu không yêu cầu, hãy <strong>vô hiệu hóa</strong> phản ứng này bằng cách bỏ qua email</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Chemical Elements Grid -->
                <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0;'>
                    <div style='background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); border-radius: 12px; padding: 20px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
                        <div style='font-size: 32px; font-weight: 700; font-family: ""Orbitron"", monospace;'>H</div>
                        <div style='font-size: 11px; margin-top: 5px; opacity: 0.9;'>Hydro</div>
                        <div style='font-size: 10px; margin-top: 3px; opacity: 0.7;'>Bảo Mật</div>
                    </div>
                    <div style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 20px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
                        <div style='font-size: 32px; font-weight: 700; font-family: ""Orbitron"", monospace;'>O</div>
                        <div style='font-size: 11px; margin-top: 5px; opacity: 0.9;'>Oxy</div>
                        <div style='font-size: 10px; margin-top: 3px; opacity: 0.7;'>Tốc Độ</div>
                    </div>
                    <div style='background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; padding: 20px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
                        <div style='font-size: 32px; font-weight: 700; font-family: ""Orbitron"", monospace;'>N</div>
                        <div style='font-size: 11px; margin-top: 5px; opacity: 0.9;'>Nitơ</div>
                        <div style='font-size: 10px; margin-top: 3px; opacity: 0.7;'>An Toàn</div>
                    </div>
                </div>
                
                <!-- Instructions -->
                <div style='background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%); border-left: 5px solid #00acc1; padding: 20px; border-radius: 10px; margin: 25px 0;'>
                    <h3 style='margin: 0 0 15px 0; color: #00838f; font-size: 16px; display: flex; align-items: center;'>
                        <span style='font-size: 24px; margin-right: 10px;'>🔬</span>
                        Hướng Dẫn Thực Hiện Phản Ứng
                    </h3>
                    <ol style='margin: 0; padding-left: 25px; color: #00695c; line-height: 1.8; font-size: 14px;'>
                        <li>Quay lại trang đặt lại mật khẩu trên website</li>
                        <li>Nhập chính xác mã OTP <strong style='font-family: monospace; background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;'>{otp}</strong></li>
                        <li>Tạo mật khẩu mới có độ mạnh cao (giống công thức hóa học phức tạp!)</li>
                        <li>Hoàn tất và đăng nhập với mật khẩu mới</li>
                    </ol>
                </div>
                
                <!-- Chemical reaction equation -->
                <div style='text-align: center; margin: 30px 0; padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;'>
                    <p style='font-family: monospace; font-size: 18px; color: #667eea; margin: 0; font-weight: 600;'>
                        OTP + NewPassword → 🔐 SecureAccount ✓
                    </p>
                    <p style='font-size: 12px; color: #999; margin: 10px 0 0 0;'>
                        Phương trình phản ứng đặt lại mật khẩu
                    </p>
                </div>
                
            </div>
            
            <!-- Footer -->
            <div style='background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px 30px; text-align: center; border-top: 3px solid #667eea;'>
                <p style='margin: 0 0 10px 0; color: #5a6c7d; font-size: 13px;'>
                    <strong style='color: #667eea; font-size: 15px;'>Chemistry Learning Platform</strong><br/>
                    Hệ thống quản lý bài giảng Hóa học chuyên nghiệp
                </p>
                <p style='margin: 10px 0 0 0; color: #95a5a6; font-size: 11px;'>
                    🧪 Email tự động - Vui lòng không trả lời<br/>
                    © 2025 Chemistry Learning Platform. All rights reserved.
                </p>
                <div style='margin-top: 15px; font-size: 20px;'>
                    ⚗️ 🧬 ⚛️ 🔬 🧪
                </div>
            </div>
            
        </div>
        
        <!-- Bottom decoration molecules -->
        <div style='text-align: center; margin-top: 20px; font-size: 12px; color: rgba(255,255,255,0.7);'>
            <p style='margin: 0;'>🧪 Phản ứng được bảo vệ bởi công nghệ mã hóa tiên tiến 🧪</p>
        </div>
        
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, body);
    }
}