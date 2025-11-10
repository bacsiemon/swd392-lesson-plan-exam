using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Text;
using System.Text.RegularExpressions;

namespace LessonPlanExam.Services.Services
{
    public class LessonPlanAiGenerationService : ILessonPlanAiGenerationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccountService _accountService;
        private readonly GeminiApiSettings _geminiSettings;
        private readonly HttpClient _httpClient;

        public LessonPlanAiGenerationService(
            IUnitOfWork unitOfWork, 
            IAccountService accountService,
            IOptions<GeminiApiSettings> geminiSettings,
            HttpClient httpClient)
        {
            _unitOfWork = unitOfWork;
            _accountService = accountService;
            _geminiSettings = geminiSettings.Value;
            _httpClient = httpClient;
        }

        public async Task<BaseResponse<LessonPlan>> GenerateLessonPlanAsync(GenerateLessonPlanAiRequest request)
        {
            // Validate user role
            var currentRole = _accountService.GetCurrentUserRole();
            if (currentRole != Repositories.Enums.EUserRole.Teacher)
            {
                return new BaseResponse<LessonPlan>
                {
                    StatusCode = 401,
                    Errors = "TEACHER_ONLY"
                };
            }

            var currentUserId = _accountService.GetCurrentUserId();

            try
            {
                // Generate lesson plan content using Gemini AI
                var aiResponse = await CallGeminiApiAsync(request);
                
                if (aiResponse == null)
                {
                    return new BaseResponse<LessonPlan>
                    {
                        StatusCode = 500,
                        Errors = "AI_GENERATION_FAILED"
                    };
                }

                // Create lesson plan entity
                var lessonPlan = new LessonPlan
                {
                    Title = aiResponse.Title,
                    Objectives = aiResponse.Objectives,
                    Description = aiResponse.Description,
                    GradeLevel = request.GradeLevel,
                    CreatedByTeacher = currentUserId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    SlotPlans = new List<SlotPlan>()
                };

                // Create slot plans - ensure we don't exceed the requested number
                var maxSlots = Math.Min(aiResponse.SlotPlans.Count, request.NumberOfSlots);
                for (int i = 0; i < maxSlots; i++)
                {
                    var slotPlanData = aiResponse.SlotPlans[i];
                    var slotPlan = new SlotPlan
                    {
                        SlotNumber = i + 1,
                        Title = slotPlanData.Title ?? $"Tiết {i + 1}",
                        Objectives = slotPlanData.Objectives,
                        EquipmentNeeded = slotPlanData.EquipmentNeeded,
                        Preparations = slotPlanData.Preparations,
                        Activities = slotPlanData.Activities ?? slotPlanData.Content ?? "Nội dung sẽ được cập nhật",
                        ReviseQuestions = slotPlanData.ReviseQuestions,
                        DurationMinutes = request.DurationMinutesPerSlot,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    lessonPlan.SlotPlans.Add(slotPlan);
                }

                // If AI generated fewer slots than requested, create placeholder slots
                for (int i = aiResponse.SlotPlans.Count; i < request.NumberOfSlots; i++)
                {
                    var slotPlan = new SlotPlan
                    {
                        SlotNumber = i + 1,
                        Title = $"Tiết {i + 1}",
                        Objectives = "Mục tiêu sẽ được cập nhật",
                        EquipmentNeeded = "Thiết bị sẽ được cập nhật",
                        Preparations = "Chuẩn bị sẽ được cập nhật",
                        Activities = "Hoạt động sẽ được cập nhật",
                        ReviseQuestions = "Câu hỏi sẽ được cập nhật",
                        DurationMinutes = request.DurationMinutesPerSlot,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    lessonPlan.SlotPlans.Add(slotPlan);
                }

                // Return the generated lesson plan without saving to database
                return new BaseResponse<LessonPlan>
                {
                    StatusCode = 201,
                    Message = "SUCCESS",
                    Data = lessonPlan
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse<LessonPlan>
                {
                    StatusCode = 500,
                    Errors = "AI_GENERATION_FAILED",
                    Message = ex.Message
                };
            }
        }

        private async Task<GeminiLessonPlanResponse?> CallGeminiApiAsync(GenerateLessonPlanAiRequest request)
        {
            if (string.IsNullOrEmpty(_geminiSettings.ApiKey))
            {
                throw new InvalidOperationException("Gemini API key not configured");
            }

            var url = $"{_geminiSettings.BaseUrl}/models/{_geminiSettings.Model}:generateContent?key={_geminiSettings.ApiKey}";

            var prompt = CreatePrompt(request);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = _geminiSettings.Temperature,
                    topK = _geminiSettings.TopK,
                    topP = _geminiSettings.TopP,
                    maxOutputTokens = _geminiSettings.MaxOutputTokens,
                    responseMimeType = "application/json"
                }
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Gemini API call failed: {response.StatusCode} - {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonConvert.DeserializeObject<GeminiApiResponse>(responseContent);

            if (geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text == null)
            {
                return null;
            }

            var generatedText = geminiResponse.Candidates.First().Content.Parts.First().Text;
            
            return ParseLessonPlanResponse(generatedText, request.NumberOfSlots);
        }

        private GeminiLessonPlanResponse? ParseLessonPlanResponse(string generatedText, int expectedSlots)
        {
            try
            {
                // First attempt: direct JSON parsing
                return JsonConvert.DeserializeObject<GeminiLessonPlanResponse>(generatedText);
            }
            catch (JsonException ex)
            {
                try
                {
                    // Second attempt: extract JSON from response text
                    var cleanedJson = ExtractAndCleanJson(generatedText);
                    if (!string.IsNullOrEmpty(cleanedJson))
                    {
                        return JsonConvert.DeserializeObject<GeminiLessonPlanResponse>(cleanedJson);
                    }
                }
                catch (JsonException)
                {
                    // If JSON parsing still fails, try to fix common issues
                    try
                    {
                        var fixedJson = FixMalformedJson(generatedText, expectedSlots);
                        if (!string.IsNullOrEmpty(fixedJson))
                        {
                            return JsonConvert.DeserializeObject<GeminiLessonPlanResponse>(fixedJson);
                        }
                    }
                    catch (JsonException)
                    {
                        // Final fallback: create a basic structure from the text
                        return CreateFallbackResponse(generatedText, expectedSlots);
                    }
                }
                
                throw new JsonException($"Failed to parse AI response as JSON: {ex.Message}");
            }
        }

        private string ExtractAndCleanJson(string text)
        {
            // Find JSON boundaries
            var jsonStart = text.IndexOf('{');
            var jsonEnd = text.LastIndexOf('}');
            
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonSubstring = text.Substring(jsonStart, jsonEnd - jsonStart + 1);
                
                // Clean up common formatting issues
                jsonSubstring = jsonSubstring
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Replace("\n", " ")
                    .Replace("\r", " ");
                
                // Remove extra whitespace
                jsonSubstring = Regex.Replace(jsonSubstring, @"\s+", " ").Trim();
                
                return jsonSubstring;
            }
            
            return string.Empty;
        }

        private string FixMalformedJson(string text, int expectedSlots)
        {
            try
            {
                var cleanJson = ExtractAndCleanJson(text);
                if (string.IsNullOrEmpty(cleanJson))
                    return string.Empty;

                // Try to fix incomplete array by finding the last complete object
                if (cleanJson.Contains("slotPlans") && cleanJson.Contains("["))
                {
                    var slotPlansStart = cleanJson.IndexOf("\"slotPlans\":");
                    if (slotPlansStart > 0)
                    {
                        var arrayStart = cleanJson.IndexOf('[', slotPlansStart);
                        if (arrayStart > 0)
                        {
                            // Count complete objects in the array
                            var objectCount = 0;
                            var braceCount = 0;
                            var inObject = false;
                            var lastCompleteObjectEnd = arrayStart;

                            for (int i = arrayStart + 1; i < cleanJson.Length; i++)
                            {
                                if (cleanJson[i] == '{')
                                {
                                    braceCount++;
                                    inObject = true;
                                }
                                else if (cleanJson[i] == '}')
                                {
                                    braceCount--;
                                    if (braceCount == 0 && inObject)
                                    {
                                        objectCount++;
                                        lastCompleteObjectEnd = i;
                                        inObject = false;
                                    }
                                }
                                else if (cleanJson[i] == ']' && braceCount == 0)
                                {
                                    break;
                                }
                            }

                            // If we have incomplete objects, truncate to last complete object
                            if (braceCount > 0 && objectCount > 0)
                            {
                                var beforeArray = cleanJson.Substring(0, arrayStart + 1);
                                var completeObjects = cleanJson.Substring(arrayStart + 1, lastCompleteObjectEnd - arrayStart);
                                var afterArray = "]}}";
                                
                                cleanJson = beforeArray + completeObjects + afterArray;
                            }
                        }
                    }
                }

                return cleanJson;
            }
            catch
            {
                return string.Empty;
            }
        }

        private GeminiLessonPlanResponse CreateFallbackResponse(string text, int expectedSlots)
        {
            // Extract basic information from text even if JSON parsing fails
            var response = new GeminiLessonPlanResponse
            {
                Title = ExtractTitle(text) ?? "Bài học được tạo tự động",
                Objectives = ExtractObjectives(text) ?? "Mục tiêu sẽ được cập nhật",
                Description = ExtractDescription(text) ?? "Mô tả sẽ được cập nhật",
                SlotPlans = new List<GeminiSlotPlan>()
            };

            // Create basic slot plans
            for (int i = 0; i < expectedSlots; i++)
            {
                response.SlotPlans.Add(new GeminiSlotPlan
                {
                    Title = $"Tiết {i + 1}",
                    Objectives = $"Mục tiêu cho tiết {i + 1}",
                    EquipmentNeeded = "Thiết bị cơ bản",
                    Preparations = "Chuẩn bị tài liệu",
                    Activities = $"Hoạt động cho tiết {i + 1} sẽ được cập nhật",
                    ReviseQuestions = "Câu hỏi ôn tập sẽ được bổ sung"
                });
            }

            return response;
        }

        private string? ExtractTitle(string text)
        {
            var titleMatch = Regex.Match(text, @"""title"":\s*""([^""]+)""", RegexOptions.IgnoreCase);
            return titleMatch.Success ? titleMatch.Groups[1].Value : null;
        }

        private string? ExtractObjectives(string text)
        {
            var objectivesMatch = Regex.Match(text, @"""objectives"":\s*""([^""]+)""", RegexOptions.IgnoreCase);
            return objectivesMatch.Success ? objectivesMatch.Groups[1].Value : null;
        }

        private string? ExtractDescription(string text)
        {
            var descriptionMatch = Regex.Match(text, @"""description"":\s*""([^""]+)""", RegexOptions.IgnoreCase);
            return descriptionMatch.Success ? descriptionMatch.Groups[1].Value : null;
        }

        private string CreatePrompt(GenerateLessonPlanAiRequest request)
        {
            return $@"
Bạn là một chuyên gia giáo dục với nhiều năm kinh nghiệm trong việc thiết kế giáo án. 
Hãy tạo giáo án chi tiết, chuẩn chương trình của Bộ Giáo Dục và Đào Tạo dựa trên yêu cầu sau:

Yêu cầu: {request.Prompt} 
Lớp: {request.GradeLevel} 
Số tiết học: {request.NumberOfSlots} 
Thời gian mỗi tiết: {request.DurationMinutesPerSlot} phút

Hãy trả về kết quả CHÍNH XÁC theo định dạng JSON sau, không có văn bản nào khác:

{{
  ""title"": ""Tên bài học"",
  ""objectives"": ""Mục tiêu bài học cụ thể và có thể đo lường được"",
  ""description"": ""Mô tả tổng quan về bài học, nội dung chính và phương pháp giảng dạy"",
  ""slotPlans"": [
    {{
      ""title"": ""Tên tiết học 1"",
      ""objectives"": ""Mục tiêu tiết học 1"",
      ""equipmentNeeded"": ""Thiết bị cần thiết cho tiết 1"",
      ""preparations"": ""Chuẩn bị cho tiết 1"",
      ""activities"": ""Các hoạt động trong tiết 1"",
      ""reviseQuestions"": ""Các câu hỏi ôn tập tiết 1""
    }},
    {{
      ""title"": ""Tên tiết học 2"",
      ""objectives"": ""Mục tiêu tiết học 2"",
      ""equipmentNeeded"": ""Thiết bị cần thiết cho tiết 2"",
      ""preparations"": ""Chuẩn bị cho tiết 2"",
      ""activities"": ""Các hoạt động trong tiết 2"",
      ""reviseQuestions"": ""Các câu hỏi ôn tập tiết 2""
    }}
  ]
}}

YÊU CẦU QUAN TRỌNG:
- Tạo đúng {request.NumberOfSlots} tiết học trong mảng slotPlans
- Đảm bảo JSON hoàn chỉnh và đúng cú pháp
- Không thêm text hay markdown nào bên ngoài JSON
- Mỗi slotPlan phải có đầy đủ các trường: title, objectives, equipmentNeeded, preparations, activities, reviseQuestions
- Nội dung phù hợp với lứa tuổi lớp {request.GradeLevel}
- Các hoạt động phải cụ thể và có thể thực hiện được
";
        }

        private class GeminiApiResponse
        {
            [JsonProperty("candidates")]
            public List<Candidate>? Candidates { get; set; }
        }

        private class Candidate
        {
            [JsonProperty("content")]
            public Content? Content { get; set; }
        }

        private class Content
        {
            [JsonProperty("parts")]
            public List<Part>? Parts { get; set; }
        }

        private class Part
        {
            [JsonProperty("text")]
            public string? Text { get; set; }
        }

        private class GeminiLessonPlanResponse
        {
            [JsonProperty("title")]
            public string Title { get; set; } = null!;

            [JsonProperty("objectives")]
            public string Objectives { get; set; } = null!;

            [JsonProperty("description")]
            public string Description { get; set; } = null!;

            [JsonProperty("slotPlans")]
            public List<GeminiSlotPlan> SlotPlans { get; set; } = new();
        }

        private class GeminiSlotPlan
        {
            [JsonProperty("title")]
            public string Title { get; set; } = null!;

            [JsonProperty("objectives")]
            public string? Objectives { get; set; }

            [JsonProperty("equipmentNeeded")]
            public string? EquipmentNeeded { get; set; }

            [JsonProperty("preparations")]
            public string? Preparations { get; set; }

            [JsonProperty("activities")]
            public string? Activities { get; set; }

            [JsonProperty("reviseQuestions")]
            public string? ReviseQuestions { get; set; }

            // Keep content for backward compatibility
            [JsonProperty("content")]
            public string? Content { get; set; }
        }
    }
}