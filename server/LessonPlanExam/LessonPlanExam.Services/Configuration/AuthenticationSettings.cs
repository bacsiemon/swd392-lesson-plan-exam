namespace LessonPlanExam.Services.Configuration;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpireMinutes { get; set; } = 60;
    public int RefreshTokenExpireDays { get; set; } = 7;
}

public class EmailSettings
{
    public const string SectionName = "EmailSettings";

    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderPassword { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
}