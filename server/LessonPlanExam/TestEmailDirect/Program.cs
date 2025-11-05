using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace TestEmailDirect
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Testing Gmail SMTP from C# ===");
            Console.WriteLine();

            var smtpServer = "smtp.gmail.com";
            var smtpPort = 587;
            var senderEmail = "babyheromac@gmail.com";
            var senderPassword = "fkvfmnxmaabcwokz"; // App Password
            var recipientEmail = "haomase182227@fpt.edu.vn";
            var senderName = "Lesson Plan Exam - C# TEST";

            Console.WriteLine($"SMTP Server: {smtpServer}");
            Console.WriteLine($"SMTP Port: {smtpPort}");
            Console.WriteLine($"Sender: {senderEmail}");
            Console.WriteLine($"Recipient: {recipientEmail}");
            Console.WriteLine($"App Password: {senderPassword.Substring(0, 4)}****{senderPassword.Substring(senderPassword.Length - 4)}");
            Console.WriteLine();

            try
            {
                Console.WriteLine("Creating SMTP client...");
                
                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    EnableSsl = true,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(senderEmail, senderPassword),
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Timeout = 30000
                };

                Console.WriteLine("SMTP client created!");
                Console.WriteLine();

                Console.WriteLine("Creating email message...");
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = "TEST - SMTP Connection from C# Console",
                    Body = @"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2 style='color: #4CAF50;'>✅ C# SMTP Connection Test SUCCESSFUL!</h2>
    <p>Nếu bạn nhận được email này, nghĩa là C# SmtpClient đang hoạt động HOÀN HẢO!</p>
    <p><strong>Test Time:</strong> " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"</p>
    <hr/>
    <p style='color: #666; font-size: 12px;'>
        Test từ C# Console Application - Lesson Plan Exam System
    </p>
</body>
</html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(recipientEmail);
                Console.WriteLine("Email message created!");
                Console.WriteLine();

                Console.WriteLine("Sending email...");
                Console.WriteLine("Please wait...");
                
                await client.SendMailAsync(mailMessage);

                Console.WriteLine();
                Console.WriteLine("========================================");
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✅ EMAIL SENT SUCCESSFULLY!");
                Console.ResetColor();
                Console.WriteLine("========================================");
                Console.WriteLine();
                Console.WriteLine($"Kiểm tra inbox của {recipientEmail}");
                Console.WriteLine("Hoặc kiểm tra Spam folder nếu không thấy trong Inbox");
            }
            catch (Exception ex)
            {
                Console.WriteLine();
                Console.WriteLine("========================================");
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("❌ EMAIL SENDING FAILED!");
                Console.ResetColor();
                Console.WriteLine("========================================");
                Console.WriteLine();
                Console.WriteLine($"Error Type: {ex.GetType().Name}");
                Console.WriteLine($"Error Message: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine();
                Console.WriteLine("Possible causes:");
                Console.WriteLine("1. App Password incorrect");
                Console.WriteLine("2. Network/Firewall blocking port 587");
                Console.WriteLine("3. Gmail authentication issue");
            }

            Console.WriteLine();
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}
