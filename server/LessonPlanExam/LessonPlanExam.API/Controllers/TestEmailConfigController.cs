using LessonPlanExam.Services.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LessonPlanExam.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TestEmailConfigController : ControllerBase
{
    private readonly EmailSettings _emailSettings;

    public TestEmailConfigController(IOptions<EmailSettings> emailSettings)
    {
        _emailSettings = emailSettings.Value;
    }

    [HttpGet("config")]
    public IActionResult GetEmailConfig()
    {
        return Ok(new
        {
            SmtpServer = _emailSettings.SmtpServer,
            SmtpPort = _emailSettings.SmtpPort,
            SenderEmail = _emailSettings.SenderEmail,
            SenderPassword = MaskPassword(_emailSettings.SenderPassword),
            SenderName = _emailSettings.SenderName,
            PasswordLength = _emailSettings.SenderPassword?.Length ?? 0,
            PasswordFirstFour = _emailSettings.SenderPassword?.Length >= 4 
                ? _emailSettings.SenderPassword.Substring(0, 4) 
                : "N/A",
            PasswordLastFour = _emailSettings.SenderPassword?.Length >= 4 
                ? _emailSettings.SenderPassword.Substring(_emailSettings.SenderPassword.Length - 4) 
                : "N/A"
        });
    }

    private string MaskPassword(string password)
    {
        if (string.IsNullOrEmpty(password)) return "EMPTY";
        if (password.Length <= 8) return "****";
        return $"{password.Substring(0, 4)}****{password.Substring(password.Length - 4)}";
    }
}
