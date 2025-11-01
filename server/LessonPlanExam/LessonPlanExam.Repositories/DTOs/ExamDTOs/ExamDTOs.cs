using LessonPlanExam.Repositories.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.ExamDTOs
{
    public class ExamCreateRequest
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int CreatedByTeacher { get; set; }

        public int? GradeLevel { get; set; }

        public int? DurationMinutes { get; set; }

        public decimal? PassThreshold { get; set; }

        public bool? ShowResultsImmediately { get; set; }

        public bool? ShowCorrectAnswers { get; set; }

        public bool? RandomizeQuestions { get; set; }

        public bool? RandomizeAnswers { get; set; }

        public EScoringMethod? ScoringMethodEnum { get; set; }

        public int? MaxAttempts { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public string Password { get; set; }

        public EExamStatus? StatusEnum { get; set; }

        public int? ExamMatrixId { get; set; }

        public int? TotalQuestions { get; set; }

        public decimal? TotalPoints { get; set; }
    }

    public class ExamUpdateRequest : ExamCreateRequest { }

    public class ExamFromMatrixRequest
    {
        [Required]
        public int ExamMatrixId { get; set; }

        // Optionally override some exam properties
        public string Title { get; set; }
        public string Description { get; set; }
        public int CreatedByTeacher { get; set; }
        public int? GradeLevel { get; set; }
        public int? DurationMinutes { get; set; }
        public decimal? PassThreshold { get; set; }
        public bool? ShowResultsImmediately { get; set; }
        public bool? ShowCorrectAnswers { get; set; }
        public bool? RandomizeQuestions { get; set; }
        public bool? RandomizeAnswers { get; set; }
        public EScoringMethod? ScoringMethodEnum { get; set; }
        public int? MaxAttempts { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Password { get; set; }

        // If provided, total points to distribute among generated questions
        public decimal? TotalPoints { get; set; }
    }

    public class ExamResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int CreatedByTeacher { get; set; }
        public int? GradeLevel { get; set; }
        public int DurationMinutes { get; set; }
        public decimal? PassThreshold { get; set; }
        public bool? ShowResultsImmediately { get; set; }
        public bool? ShowCorrectAnswers { get; set; }
        public bool? RandomizeQuestions { get; set; }
        public bool? RandomizeAnswers { get; set; }
        public EScoringMethod? ScoringMethodEnum { get; set; }
        public int? MaxAttempts { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public EExamStatus? StatusEnum { get; set; }
        public int? ExamMatrixId { get; set; }
        public int? TotalQuestions { get; set; }
        public decimal? TotalPoints { get; set; }

        public List<ExamQuestionResponse> Questions { get; set; } = new List<ExamQuestionResponse>();
    }

    public class ExamQuestionResponse
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int QuestionId { get; set; }
        public int OrderIndex { get; set; }
        public decimal? Points { get; set; }

        // Basic question preview
        public string QuestionTitle { get; set; }
        public string QuestionContent { get; set; }
        public int QuestionDifficultyId { get; set; }
        public int QuestionTypeEnum { get; set; }
    }

    public class ExamQuestionAddRequest
    {
        [Required]
        public int QuestionId { get; set; }

        public decimal? Points { get; set; }

        public int? OrderIndex { get; set; }
    }

    public class UpdateExamStatusRequest
    {
        [Required]
        public EExamStatus StatusEnum { get; set; }
    }

    public class PreviewRandomResponse
    {
        public List<PreviewQuestionItem> Questions { get; set; } = new List<PreviewQuestionItem>();
    }

    public class PreviewQuestionItem
    {
        public int QuestionId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int QuestionTypeEnum { get; set; }
        public decimal? Points { get; set; }
    }

    public class AccessCheckResponse
    {
        public bool Ok { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
