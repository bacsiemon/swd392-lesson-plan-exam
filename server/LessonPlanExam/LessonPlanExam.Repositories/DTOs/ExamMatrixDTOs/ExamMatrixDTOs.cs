using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs
{
    public class ExamMatrixCreateRequest
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required]
        public int TeacherId { get; set; }

        public int? TotalQuestions { get; set; }

        public decimal? TotalPoints { get; set; }

        public string? Configuration { get; set; }
    }

    public class ExamMatrixUpdateRequest
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public string Description { get; set; }

        public int? TotalQuestions { get; set; }

        public decimal? TotalPoints { get; set; }

        public string? Configuration { get; set; }
    }

    public class ExamMatrixResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TeacherId { get; set; }
        public int? TotalQuestions { get; set; }
        public decimal? TotalPoints { get; set; }
        public string? Configuration { get; set; }
    }

    public class ExamMatrixItemCreateRequest
    {
        [Required]
        public int QuestionBankId { get; set; }

        public string Domain { get; set; }

        public int? DifficultyLevel { get; set; }

        [Required]
        public int QuestionCount { get; set; }

        public decimal? PointsPerQuestion { get; set; }
    }

    public class ExamMatrixItemUpdateRequest
    {
        [Required]
        public int QuestionBankId { get; set; }

        public string Domain { get; set; }

        public int? DifficultyLevel { get; set; }

        [Required]
        public int QuestionCount { get; set; }

        public decimal? PointsPerQuestion { get; set; }
    }

    public class ExamMatrixItemResponse
    {
        public int Id { get; set; }
        public int ExamMatrixId { get; set; }
        public int QuestionBankId { get; set; }
        public string Domain { get; set; }
        public int? DifficultyLevel { get; set; }
        public int QuestionCount { get; set; }
        public decimal? PointsPerQuestion { get; set; }
    }

    public class ValidationResponse
    {
        public bool Ok { get; set; }
        public List<ShortageInfo> Shortages { get; set; } = new List<ShortageInfo>();
    }

    public class ShortageInfo
    {
        public int ItemId { get; set; }
        public int Needed { get; set; }
        public int Available { get; set; }
    }
}

