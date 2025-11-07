using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.QuestionDifficultyDTOs
{
    public class CreateQuestionDifficultyRequest
    {
        [Required]
        [StringLength(100)]
        public string Domain { get; set; }

        [Required]
        public int DifficultyLevel { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }
    }

    public class UpdateQuestionDifficultyRequest
    {
        [Required]
        [StringLength(100)]
        public string Domain { get; set; }

        [Required]
        public int DifficultyLevel { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }
    }

    public class QuestionDifficultyResponse
    {
        public int Id { get; set; }
        public string Domain { get; set; }
        public int DifficultyLevel { get; set; }
        public string? Description { get; set; }
    }

    public class QuestionDifficultyListItem
    {
        public int Id { get; set; }
        public string Domain { get; set; }
        public int DifficultyLevel { get; set; }
        public string? Description { get; set; }
    }
}
