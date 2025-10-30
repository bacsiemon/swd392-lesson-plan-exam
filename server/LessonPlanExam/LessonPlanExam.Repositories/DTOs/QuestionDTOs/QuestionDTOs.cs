using LessonPlanExam.Repositories.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LessonPlanExam.Repositories.DTOs.QuestionDTOs
{
    public class QuestionCreateRequest
    {
        [Required]
        public int QuestionBankId { get; set; }
        [Required]
        [StringLength(500)]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        [Required]
        public EQuestionType QuestionTypeEnum { get; set; }
        public int? QuestionDifficultyId { get; set; }
        public string AdditionalData { get; set; }
        // MC
        public List<MultipleChoiceAnswerPayload> MultipleChoiceAnswers { get; set; }
        // FillBlank
        public List<FillBlankAnswerPayload> FillBlankAnswers { get; set; }
    }

    public class MultipleChoiceAnswerPayload
    {
        [Required]
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; }
        public string Explanation { get; set; }
        public int? OrderIndex { get; set; }
    }

    public class FillBlankAnswerPayload
    {
        [Required]
        public string CorrectAnswer { get; set; }
        public string NormalizedCorrectAnswer { get; set; }
        public string Explanation { get; set; }
    }

    public class QuestionUpdateRequest : QuestionCreateRequest { }

    public class QuestionResponse
    {
        public int Id { get; set; }
        public int QuestionBankId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public EQuestionType QuestionTypeEnum { get; set; }
        public int? QuestionDifficultyId { get; set; }
        public string AdditionalData { get; set; }
        public bool? IsActive { get; set; }
        public List<MultipleChoiceAnswerPayload> MultipleChoiceAnswers { get; set; }
        public List<FillBlankAnswerPayload> FillBlankAnswers { get; set; }
    }

    public class BulkCreateQuestionsRequest
    {
        [Required]
        public int QuestionBankId { get; set; }
        [Required]
        public List<QuestionCreateRequest> Items { get; set; }
    }
}
