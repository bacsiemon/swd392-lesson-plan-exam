using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.AttemptDTOs
{
    public class AttemptStartResponse
    {
        public int AttemptId { get; set; }
        public int AttemptNumber { get; set; }
        public int ExamId { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime StartedAt { get; set; }
        public List<AttemptQuestionItem> Questions { get; set; } = new List<AttemptQuestionItem>();
    }

    public class AttemptQuestionItem
    {
        public int QuestionId { get; set; }
        public int OrderIndex { get; set; }
        public decimal? PointsPossible { get; set; }
        // For MCQ, options will be loaded separately in client via Questions API
    }

    public class SaveAnswerRequest
    {
        [Required]
        public int QuestionId { get; set; }

        // Comma separated selected answer ids for MCQ
        public string SelectedAnswerIds { get; set; }

        // For fill blank
        public string TextAnswer { get; set; }

        // Additional data (json)
        public string AnswerData { get; set; }
    }

    public class SubmitResponse
    {
        public int AttemptId { get; set; }
        public decimal TotalScore { get; set; }
        public decimal ScorePercentage { get; set; }
        public bool Passed { get; set; }
        public List<SubmitQuestionDetail> Details { get; set; } = new List<SubmitQuestionDetail>();
    }

    public class SubmitQuestionDetail
    {
        public int QuestionId { get; set; }
        public decimal PointsPossible { get; set; }
        public decimal PointsEarned { get; set; }
        public bool Correct { get; set; }
        public string Explanation { get; set; }
    }

    public class AttemptDetailResponse
    {
        public int AttemptId { get; set; }
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public EAttemptStatus? StatusEnum { get; set; }
        public decimal? TotalScore { get; set; }
        public decimal? MaxScore { get; set; }
        public decimal? ScorePercentage { get; set; }
        public List<AttemptAnswerItem> Answers { get; set; } = new List<AttemptAnswerItem>();
    }

    public class AttemptAnswerItem
    {
        public int QuestionId { get; set; }
        public List<int> SelectedAnswerIds { get; set; } = new List<int>();
        public string TextAnswer { get; set; }
        public string AnswerData { get; set; }
        public decimal? PointsEarned { get; set; }
        public decimal? PointsPossible { get; set; }
        public bool? IsCorrect { get; set; }
    }
}
