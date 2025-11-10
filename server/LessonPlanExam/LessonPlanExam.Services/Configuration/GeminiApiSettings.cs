namespace LessonPlanExam.Services.Configuration
{
    public class GeminiApiSettings
    {
        public const string SectionName = "GeminiApi";

        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta";
        public string Model { get; set; } = "gemini-2.0-flash-exp";
        public double Temperature { get; set; } = 0.7;
        public int TopK { get; set; } = 40;
        public double TopP { get; set; } = 0.95;
        public int MaxOutputTokens { get; set; } = 8192;
    }
}